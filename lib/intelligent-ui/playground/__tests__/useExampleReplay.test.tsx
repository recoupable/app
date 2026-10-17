// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useExampleReplay } from "../useExampleReplay";
import { useTimelinePosition } from "../../representations/useTimelinePosition";
import { playgroundScenarios } from "../scenarios";

const scenario = playgroundScenarios[0];
const fetchMock = vi.fn();

function response(events: unknown[], suffix = "") {
  return {
    ok: true,
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            events.map((event) => `${JSON.stringify(event)}\n`).join("") +
              suffix,
          ),
        );
        controller.close();
      },
    }),
  } as Response;
}

function deferredResponse() {
  let resolve!: (value: Response) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<Response>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useExampleReplay", () => {
  it("accepts an ordered example through completion with an abortable no-store request", async () => {
    fetchMock.mockResolvedValue(response(scenario.events));
    const { result } = renderHook(() => useExampleReplay(scenario));
    expect(result.current.status).toBe("ready");
    expect(result.current.completedSurface).toBeNull();
    await act(async () => {
      await result.current.replay();
    });
    expect(result.current.status).toBe("complete");
    expect(result.current.surface.revision).toBe(2);
    expect(result.current.completedSurface).toBe(result.current.surface);
    expect(result.current.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/intelligent-ui/playground?scenario=release",
      {
        signal: expect.any(AbortSignal),
        cache: "no-store",
      },
    );
  });

  it("keeps the last valid revision when a later update is malformed", async () => {
    fetchMock.mockResolvedValue(
      response(scenario.events.slice(0, 2), "{broken}\n"),
    );
    const { result } = renderHook(() => useExampleReplay(scenario));
    await act(async () => {
      await result.current.replay();
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/could not be validated/);
    expect(result.current.surface.revision).toBe(1);
    expect(result.current.completedSurface).toBeNull();
    const collection = result.current.surface.components.find(
      (component) => component.type === "collection",
    );
    expect(collection?.rows).toHaveLength(4);
  });

  it("reports an incomplete stream while retaining its last valid surface", async () => {
    fetchMock.mockResolvedValue(response(scenario.events.slice(0, 2)));
    const { result } = renderHook(() => useExampleReplay(scenario));
    await act(async () => {
      await result.current.replay();
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/ended early/);
    expect(result.current.surface.revision).toBe(1);
    expect(result.current.completedSurface).toBeNull();
  });

  it("rejects updates after completion instead of advancing the completed view", async () => {
    fetchMock.mockResolvedValue(
      response([
        ...scenario.events,
        {
          type: "surface.patch",
          surfaceId: scenario.initial.id,
          baseRevision: 2,
          revision: 3,
          upsert: [],
          remove: [],
          fallbackText: "Untrusted later update",
        },
      ]),
    );
    const { result } = renderHook(() => useExampleReplay(scenario));
    await act(async () => {
      await result.current.replay();
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/after completion/);
    expect(result.current.surface.revision).toBe(2);
    expect(result.current.completedSurface).toBeNull();
    expect(result.current.surface.fallbackText).not.toBe(
      "Untrusted later update",
    );
  });

  it("keeps a previous completed view if a replay fails before its first valid snapshot", async () => {
    fetchMock
      .mockResolvedValueOnce(response(scenario.events))
      .mockResolvedValueOnce(response([], "{broken}\n"));
    const { result } = renderHook(() => useExampleReplay(scenario));
    await act(async () => {
      await result.current.replay();
    });
    const completed = result.current.surface;
    await act(async () => {
      await result.current.replay();
    });
    expect(result.current.status).toBe("error");
    expect(result.current.surface).toBe(completed);
    expect(result.current.completedSurface).toBe(completed);
  });

  it.each(["surface", "workspace", "subject", "kind"] as const)(
    "rejects a snapshot with a different %s",
    async (field) => {
      const foreign = structuredClone(scenario.initial);
      if (field === "surface") foreign.id = "other-surface";
      if (field === "workspace")
        foreign.context.workspaceId = "other-workspace";
      if (field === "subject") foreign.context.subject.id = "other-subject";
      if (field === "kind") foreign.context.subject.kind = "other-kind";
      fetchMock.mockResolvedValue(
        response([{ type: "surface.snapshot", surface: foreign }]),
      );
      const { result } = renderHook(() => useExampleReplay(scenario));
      await act(async () => {
        await result.current.replay();
      });
      expect(result.current.status).toBe("error");
      expect(result.current.error).toMatch(/different workspace or subject/);
      expect(result.current.surface).toEqual(scenario.initial);
      expect(result.current.completedSurface).toBeNull();
    },
  );

  it("stops a pending stream, cancels its reader and preserves received updates", async () => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            scenario.events
              .slice(0, 2)
              .map((event) => `${JSON.stringify(event)}\n`)
              .join(""),
          ),
        );
      },
      cancel,
    });
    fetchMock.mockResolvedValue({ ok: true, body });
    const { result } = renderHook(() => useExampleReplay(scenario));
    let run!: Promise<void>;
    act(() => {
      run = result.current.replay();
    });
    await waitFor(() => expect(result.current.surface.revision).toBe(1));
    await act(async () => {
      result.current.stop();
      await run;
    });
    expect(result.current.status).toBe("stopped");
    expect(result.current.error).toBeNull();
    expect(result.current.surface.revision).toBe(1);
    expect(result.current.completedSurface).toBeNull();
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(cancel).toHaveBeenCalled();
    expect(body.locked).toBe(false);
  });

  it("a superseded request cannot overwrite the current run even if fetch ignores abort", async () => {
    const stale = deferredResponse();
    const newest = structuredClone(scenario.events);
    if (newest[0].type !== "surface.snapshot")
      throw new Error("Missing test snapshot");
    newest[0].surface.title = "Current run";
    fetchMock
      .mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce(response(newest));
    const { result } = renderHook(() => useExampleReplay(scenario));
    let oldRun!: Promise<void>;
    act(() => {
      oldRun = result.current.replay();
    });
    const oldSignal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    await act(async () => {
      await result.current.replay();
    });
    expect(oldSignal.aborted).toBe(true);
    await act(async () => {
      stale.resolve(response(scenario.events));
      await oldRun;
    });
    expect(result.current.status).toBe("complete");
    expect(result.current.surface.title).toBe("Current run");
    expect(result.current.surface.revision).toBe(2);
    expect(result.current.completedSurface).toBe(result.current.surface);
    expect(result.current.error).toBeNull();
  });

  it("a superseded fetch rejection cannot turn the completed new run into an error", async () => {
    const stale = deferredResponse();
    fetchMock
      .mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce(response(scenario.events));
    const { result } = renderHook(() => useExampleReplay(scenario));
    let oldRun!: Promise<void>;
    act(() => {
      oldRun = result.current.replay();
    });
    await act(async () => {
      await result.current.replay();
    });
    await act(async () => {
      stale.reject(new Error("The old connection failed."));
      await oldRun;
    });
    expect(result.current.status).toBe("complete");
    expect(result.current.error).toBeNull();
    expect(result.current.completedSurface).toBe(result.current.surface);
  });

  it("unmount aborts a pending stream and releases the reader", async () => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({ cancel });
    fetchMock.mockResolvedValue({ ok: true, body });
    const { result, unmount } = renderHook(() => useExampleReplay(scenario));
    let run!: Promise<void>;
    act(() => {
      run = result.current.replay();
    });
    await waitFor(() => expect(body.locked).toBe(true));
    await act(async () => {
      unmount();
      await run;
    });
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(cancel).toHaveBeenCalled();
    expect(body.locked).toBe(false);
  });

  it("streamed revisions preserve the local playback position changed during replay", async () => {
    let streamController!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
        controller.enqueue(
          new TextEncoder().encode(`${JSON.stringify(scenario.events[0])}\n`),
        );
      },
    });
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() });
    fetchMock.mockResolvedValue({ ok: true, body });
    const { result } = renderHook(() => ({
      replay: useExampleReplay(scenario),
      workingView: useTimelinePosition("replay-test", 48),
    }));
    let run!: Promise<void>;
    act(() => {
      run = result.current.replay.replay();
    });
    await waitFor(() => expect(body.locked).toBe(true));
    const userWork = 31.5;
    act(() => {
      result.current.workingView.setPosition(userWork);
    });
    await act(async () => {
      streamController.enqueue(
        new TextEncoder().encode(
          scenario.events
            .slice(1)
            .map((event) => `${JSON.stringify(event)}\n`)
            .join(""),
        ),
      );
      streamController.close();
      await run;
    });
    expect(result.current.replay.status).toBe("complete");
    expect(result.current.replay.surface.revision).toBe(2);
    expect(result.current.workingView.position).toEqual(userWork);
  });

  it("does not commit a valid completion until the stream also reaches EOF", async () => {
    let streamController!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
        controller.enqueue(
          new TextEncoder().encode(
            scenario.events
              .map((event) => `${JSON.stringify(event)}\n`)
              .join(""),
          ),
        );
      },
    });
    fetchMock.mockResolvedValue({ ok: true, body });
    const { result } = renderHook(() => useExampleReplay(scenario));
    let run!: Promise<void>;
    act(() => {
      run = result.current.replay();
    });
    await waitFor(() => expect(result.current.surface.revision).toBe(2));
    expect(result.current.status).toBe("streaming");
    expect(result.current.completedSurface).toBeNull();
    await act(async () => {
      streamController.close();
      await run;
    });
    expect(result.current.status).toBe("complete");
    expect(result.current.completedSurface).toBe(result.current.surface);
  });

  it.each(["partial", "malformed", "after-completion"] as const)(
    "preserves the prior completed document when a replacement is %s",
    async (failure) => {
      const next = structuredClone(scenario.events);
      if (next[0].type !== "surface.snapshot")
        throw new Error("Missing snapshot");
      next[0].surface.title = "Replacement run";
      const nextEvents =
        failure === "after-completion"
          ? [
              ...next,
              {
                type: "surface.patch",
                surfaceId: scenario.initial.id,
                baseRevision: 2,
                revision: 3,
                upsert: [],
                remove: [],
              },
            ]
          : next.slice(0, 2);
      fetchMock
        .mockResolvedValueOnce(response(scenario.events))
        .mockResolvedValueOnce(
          response(nextEvents, failure === "malformed" ? "{broken}\n" : ""),
        );
      const { result } = renderHook(() => useExampleReplay(scenario));
      await act(async () => {
        await result.current.replay();
      });
      const completed = result.current.completedSurface;
      await act(async () => {
        await result.current.replay();
      });
      expect(result.current.status).toBe("error");
      expect(result.current.completedSurface).toBe(completed);
      expect(result.current.surface.title).toBe("Replacement run");
      expect(result.current.surface.revision).toBe(
        failure === "after-completion" ? 2 : 1,
      );
      expect(result.current.surface).not.toBe(completed);
    },
  );

  it.each([2, 4])(
    "preserves the prior completed document when stopped after %i new events",
    async (eventCount) => {
      const next = structuredClone(scenario.events);
      if (next[0].type !== "surface.snapshot")
        throw new Error("Missing snapshot");
      next[0].surface.title = "Stopped replacement";
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              next
                .slice(0, eventCount)
                .map((event) => `${JSON.stringify(event)}\n`)
                .join(""),
            ),
          );
        },
      });
      fetchMock
        .mockResolvedValueOnce(response(scenario.events))
        .mockResolvedValueOnce({ ok: true, body });
      const { result } = renderHook(() => useExampleReplay(scenario));
      await act(async () => {
        await result.current.replay();
      });
      const completed = result.current.completedSurface;
      let run!: Promise<void>;
      act(() => {
        run = result.current.replay();
      });
      await waitFor(() =>
        expect(result.current.surface.title).toBe("Stopped replacement"),
      );
      expect(result.current.status).toBe("streaming");
      expect(result.current.completedSurface).toBe(completed);
      await act(async () => {
        result.current.stop();
        await run;
      });
      expect(result.current.status).toBe("stopped");
      expect(result.current.completedSurface).toBe(completed);
      expect(result.current.surface.revision).toBe(eventCount === 2 ? 1 : 2);
      expect(body.locked).toBe(false);
    },
  );
});
