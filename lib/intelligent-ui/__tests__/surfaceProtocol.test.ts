import { describe, expect, it, vi } from "vitest";
import { surfaceSchema, surfaceEventSchema, type Surface } from "../schema";
import { applySurfaceEvent } from "../applySurfaceEvent";
import { parseSurfaceStream } from "../parseSurfaceStream";
import { SURFACE_STREAM_LIMITS } from "../streamLimits";

const initial: Surface = {
  schemaVersion: 1,
  id: "test-surface",
  revision: 0,
  title: "A supplied recording",
  description: "Synthetic protocol test",
  context: {
    workspaceId: "workspace-one",
    subject: { kind: "recording", id: "recording-one", label: "Track one" },
  },
  components: [
    {
      type: "summary",
      id: "summary",
      title: "Context",
      text: "A supplied description",
      evidenceIds: ["source-one"],
    },
  ],
  evidence: [
    {
      id: "source-one",
      label: "Submitted description",
      sourceLabel: "Synthetic fixture",
      observedAt: "2026-10-16T12:00:00.000Z",
      text: "A supplied description",
      kind: "submitted",
      status: "partial",
    },
  ],
  fallbackText: "Track one: a supplied description. Coverage is partial.",
};

const patch = {
  type: "surface.patch" as const,
  surfaceId: initial.id,
  baseRevision: 0,
  revision: 1,
  upsert: [],
  remove: [],
};

function bytesStream(chunks: Uint8Array[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>) {
  const events = [];
  for await (const event of parseSurfaceStream(stream)) events.push(event);
  return events;
}

describe("surface contracts", () => {
  it("preserves inert submitted text without treating it as code", () => {
    const surface = structuredClone(initial);
    surface.components[0] = {
      type: "summary",
      id: "summary",
      title: "Context",
      text: "<script>doNotExecute()</script>",
      evidenceIds: ["source-one"],
    };
    expect(surfaceSchema.parse(surface)).toEqual(surface);
  });

  it("rejects unsupported versions, executable shapes and unbounded content", () => {
    expect(
      surfaceSchema.safeParse({ ...initial, schemaVersion: 2 }).success,
    ).toBe(false);
    expect(
      surfaceSchema.safeParse({ ...initial, onClick: "run()" }).success,
    ).toBe(false);
    expect(
      surfaceSchema.safeParse({ ...initial, title: "x".repeat(161) }).success,
    ).toBe(false);
  });

  it("rejects duplicate component/evidence IDs and orphan evidence references", () => {
    expect(
      surfaceSchema.safeParse({
        ...initial,
        components: [...initial.components, ...initial.components],
      }).success,
    ).toBe(false);
    expect(
      surfaceSchema.safeParse({
        ...initial,
        evidence: [...initial.evidence, ...initial.evidence],
      }).success,
    ).toBe(false);
    expect(surfaceSchema.safeParse({ ...initial, evidence: [] }).success).toBe(
      false,
    );
  });

  it("rejects duplicate nested IDs and unknown collection columns", () => {
    const row = {
      id: "row-one",
      label: "Track one",
      values: { title: "Track one" },
      evidenceIds: [],
    };
    const collection = {
      type: "collection",
      id: "tracks",
      title: "Tracks",
      columns: [{ key: "title", label: "Title" }],
      rows: [row, row],
      complete: true,
    };
    expect(
      surfaceSchema.safeParse({ ...initial, components: [collection] }).success,
    ).toBe(false);
    expect(
      surfaceSchema.safeParse({
        ...initial,
        components: [
          {
            ...collection,
            rows: [{ ...row, values: { unknown: "Not a declared column" } }],
          },
        ],
      }).success,
    ).toBe(false);
  });

  it("does not permit inconsistent collection completeness claims", () => {
    const collection = {
      type: "collection",
      id: "tracks",
      title: "Tracks",
      columns: [{ key: "title", label: "Title" }],
      rows: [
        {
          id: "row-one",
          label: "Track one",
          values: { title: "Track one" },
          evidenceIds: [],
        },
      ],
      complete: true,
      totalCount: 20,
    };
    expect(
      surfaceSchema.safeParse({ ...initial, components: [collection] }).success,
    ).toBe(false);
    expect(
      surfaceSchema.safeParse({
        ...initial,
        components: [{ ...collection, complete: false }],
      }).success,
    ).toBe(true);
  });

  it("rejects row IDs shared by collections because selection is surface-wide", () => {
    const collection = {
      type: "collection",
      id: "tracks",
      title: "Tracks",
      columns: [{ key: "title", label: "Title" }],
      rows: [
        {
          id: "shared-row",
          label: "Track",
          values: { title: "Track" },
          evidenceIds: [],
        },
      ],
      complete: true,
    };
    expect(
      surfaceSchema.safeParse({
        ...initial,
        components: [collection, { ...collection, id: "another-collection" }],
      }).success,
    ).toBe(false);
  });

  it.each([
    "javascript:alert(1)",
    "http://example.com",
    "https://user:password@example.com",
  ])("rejects unsafe evidence href %s", (href) => {
    expect(
      surfaceSchema.safeParse({
        ...initial,
        evidence: [{ ...initial.evidence[0], href }],
      }).success,
    ).toBe(false);
  });

  it("validates evidence timestamp and HTTPS links", () => {
    expect(
      surfaceSchema.safeParse({
        ...initial,
        evidence: [{ ...initial.evidence[0], observedAt: "yesterday" }],
      }).success,
    ).toBe(false);
    expect(
      surfaceSchema.parse({
        ...initial,
        evidence: [
          { ...initial.evidence[0], href: "https://example.com/source" },
        ],
      }).evidence[0].href,
    ).toBe("https://example.com/source");
  });
});

describe("surface event reducer", () => {
  it("requires a snapshot first and refuses a second snapshot", () => {
    expect(() => applySurfaceEvent(null, patch)).toThrow();
    expect(
      applySurfaceEvent(null, { type: "surface.snapshot", surface: initial }),
    ).toEqual(initial);
    expect(() =>
      applySurfaceEvent(initial, {
        type: "surface.snapshot",
        surface: initial,
      }),
    ).toThrow();
  });

  it("applies ordered upserts without mutating previous state", () => {
    const before = structuredClone(initial);
    const next = applySurfaceEvent(initial, {
      ...patch,
      upsert: [
        {
          type: "summary",
          id: "summary",
          title: "Revised",
          text: "New text",
          evidenceIds: ["source-one"],
        },
      ],
      fallbackText: "Revised fallback",
    });
    expect(next.revision).toBe(1);
    expect(next.components[0].title).toBe("Revised");
    expect(next.fallbackText).toBe("Revised fallback");
    expect(initial).toEqual(before);
  });

  it("replaces evidence atomically and rejects dangling references", () => {
    expect(() =>
      applySurfaceEvent(initial, { ...patch, evidence: [] }),
    ).toThrow();
    const next = applySurfaceEvent(initial, {
      ...patch,
      evidence: [],
      remove: ["summary"],
    });
    expect(next.components).toEqual([]);
    expect(next.evidence).toEqual([]);
  });

  it.each([
    { ...patch, baseRevision: 1, revision: 2 },
    { ...patch, revision: 0 },
    { ...patch, revision: 2 },
    { ...patch, surfaceId: "foreign-surface" },
  ])("rejects stale, skipped and foreign revisions: %j", (event) => {
    expect(() => applySurfaceEvent(initial, event)).toThrow();
  });

  it("rejects workspace injection, unknown removals and overlapping edits", () => {
    expect(
      surfaceEventSchema.safeParse({
        ...patch,
        context: { workspaceId: "foreign" },
      }).success,
    ).toBe(false);
    expect(() =>
      applySurfaceEvent(initial, { ...patch, remove: ["unknown"] }),
    ).toThrow();
    expect(() =>
      applySurfaceEvent(initial, {
        ...patch,
        remove: ["summary"],
        upsert: initial.components,
      }),
    ).toThrow();
  });

  it("validates completion scope and exact revision, returning current state", () => {
    expect(
      applySurfaceEvent(initial, {
        type: "surface.complete",
        surfaceId: initial.id,
        revision: 0,
      }),
    ).toBe(initial);
    expect(() =>
      applySurfaceEvent(initial, {
        type: "surface.complete",
        surfaceId: "foreign",
        revision: 0,
      }),
    ).toThrow();
    expect(() =>
      applySurfaceEvent(initial, {
        type: "surface.complete",
        surfaceId: initial.id,
        revision: 1,
      }),
    ).toThrow();
  });
});

describe("bounded NDJSON stream", () => {
  it("decodes UTF-8 across byte boundaries, CRLF and a final unterminated line", async () => {
    const snapshot = {
      type: "surface.snapshot",
      surface: { ...initial, title: "Café 🎵" },
    };
    const complete = {
      type: "surface.complete",
      surfaceId: initial.id,
      revision: 0,
    };
    const bytes = new TextEncoder().encode(
      `${JSON.stringify(snapshot)}\r\n\n${JSON.stringify(complete)}`,
    );
    const chunks = Array.from(bytes, (byte) => new Uint8Array([byte]));
    expect(await collect(bytesStream(chunks))).toEqual([snapshot, complete]);
  });

  it("rejects malformed JSON, events and invalid UTF-8", async () => {
    await expect(
      collect(bytesStream([new TextEncoder().encode("{broken}\n")])),
    ).rejects.toThrow();
    await expect(
      collect(bytesStream([new TextEncoder().encode('{"type":"unknown"}\n')])),
    ).rejects.toThrow();
    await expect(
      collect(bytesStream([new Uint8Array([0xc3, 0x28, 0x0a])])),
    ).rejects.toThrow();
    await expect(
      collect(bytesStream([new Uint8Array([0xc3])])),
    ).rejects.toThrow();
  });

  it("bounds a line by bytes, including multibyte text and chunked lines", async () => {
    const bytes = new TextEncoder().encode(
      "🎵".repeat(Math.floor(SURFACE_STREAM_LIMITS.lineBytes / 4) + 1),
    );
    await expect(
      collect(bytesStream([bytes.slice(0, 10), bytes.slice(10)])),
    ).rejects.toThrow(/line.*limit/i);
  });

  it("bounds total bytes and event count", async () => {
    await expect(
      collect(
        bytesStream([new Uint8Array(SURFACE_STREAM_LIMITS.totalBytes + 1)]),
      ),
    ).rejects.toThrow(/stream.*limit/i);
    const event = JSON.stringify({
      type: "surface.complete",
      surfaceId: initial.id,
      revision: 0,
    });
    await expect(
      collect(
        bytesStream([
          new TextEncoder().encode(
            `${event}\n`.repeat(SURFACE_STREAM_LIMITS.events + 1),
          ),
        ]),
      ),
    ).rejects.toThrow(/event.*limit/i);
  });

  it("cancels a pending read and releases the lock on abort", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ cancel });
    const controller = new AbortController();
    const iterator = parseSurfaceStream(stream, { signal: controller.signal });
    const pending = iterator.next();
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(cancel).toHaveBeenCalled();
    expect(stream.locked).toBe(false);
  });

  it("cancels and releases the stream when the consumer stops early", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            `${JSON.stringify({ type: "surface.snapshot", surface: initial })}\n`,
          ),
        );
      },
      cancel,
    });
    for await (const event of parseSurfaceStream(stream)) {
      expect(event.type).toBe("surface.snapshot");
      break;
    }
    expect(cancel).toHaveBeenCalled();
    expect(stream.locked).toBe(false);
  });
});
