// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CatalogReviewsPage from "../CatalogReviewsPage";

const account = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const organization = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const brief = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const caseId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const secondId = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const versionId = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const state = vi.hoisted(() => ({
  authenticated: true,
  ready: true,
  userId: "privy:actor",
  accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  organizationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" as string | null,
  initialized: true,
  api: "https://api.example",
  query: "",
  token: vi.fn(async () => "token" as string | null),
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    ready: state.ready,
    authenticated: state.authenticated,
    user: { id: state.userId },
    getAccessToken: state.token,
    login: vi.fn(),
  }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: state.accountId } }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({
    selectedOrgId: state.organizationId,
    isInitialized: state.initialized,
  }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => state.api,
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(state.query),
}));

function snapshot(revision = 0) {
  const refs = [{ source_id: "source:context", version: versionId }];
  return {
    schema_version: 1,
    case_id: caseId,
    workspace_id: organization,
    revision,
    scope: "Catalog audit of selected saved evidence",
    sources: {
      "source:context": {
        id: "source:context",
        version: versionId,
        sha256: "a".repeat(64),
        locator: "Saved context evidence",
        status: "active",
        context_source_version_id: versionId,
      },
    },
    assessments: {
      "assessment:context": {
        id: "assessment:context",
        stage: "audit",
        status: "partial",
        summary: "Selected saved assessment. Ownership unverified.",
        source_refs: refs,
        rule_version: "context-catalog-audit-v1",
        data: {
          brief_id: brief,
          missing_topics: ["ownership_documents"],
          input_manifest: { documents: [] },
        },
      },
    },
    findings: {
      "finding:retained": {
        id: "finding:retained",
        stage: "audit",
        status: "open",
        cause_id: "missing-contract",
        source_refs: refs,
        rule_version: "original-v1",
        summary: "Existing finding",
      },
    },
    actions: {},
    attempts: {},
    outcomes: {},
  };
}
function receipt<T = ReturnType<typeof snapshot>>(
  revision = 1,
  current: T = snapshot(revision) as T,
) {
  return {
    case_id: caseId,
    revision,
    state: "saved",
    evidence_kind: "customer_assertion",
    snapshot: current,
    withheld_record_ids: [],
    snapshot_usable_for_save: true,
    external_actions: "unsupported",
    created_at: "2026-10-26T01:00:00Z",
  };
}
function prepared() {
  return {
    state: "prepared",
    persisted: false,
    external_actions: "unsupported",
    snapshot: snapshot(),
  };
}
function item(id = caseId) {
  return {
    case_id: id,
    revision: 1,
    created_at: "2026-10-26T01:00:00Z",
    updated_at: "2026-10-26T01:00:00Z",
  };
}
const emptyPage = { cases: [], has_more: false, next_id: null };
type Body = Record<string, unknown>;
function install(handler: (body: Body) => unknown | Promise<unknown>) {
  const bodies: Body[] = [];
  const fetcher = vi.fn(async (url, init) => {
    expect(url).toBe("/api/context");
    expect(init.headers.Authorization).toBe("Bearer token");
    const body = JSON.parse(init.body);
    bodies.push(body);
    const result = await handler(body);
    return result instanceof Response ? result : Response.json(result);
  });
  vi.stubGlobal("fetch", fetcher);
  return { bodies, fetcher };
}
async function prepare() {
  await waitFor(() =>
    expect(
      (
        screen.getByRole("button", {
          name: "Prepare audit",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false),
  );
  fireEvent.click(screen.getByRole("button", { name: "Prepare audit" }));
  await screen.findByText("Assessment summary");
}
beforeEach(() => {
  state.authenticated = true;
  state.ready = true;
  state.userId = "privy:actor";
  state.accountId = account;
  state.organizationId = organization;
  state.initialized = true;
  state.api = "https://api.example";
  state.query = `assessment=${brief}&workspace=${organization}`;
  state.token.mockReset().mockResolvedValue("token");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("saved assessment to catalog review", () => {
  it("prepares without saving, explicitly saves, reopens and appends a dependency-bound note", async () => {
    let stored: ReturnType<typeof snapshot> | null = null;
    const { bodies } = install((body) => {
      if (body.action === "list_catalog_cases") return emptyPage;
      if (body.action === "prepare_catalog_audit") return prepared();
      if (body.action === "read_catalog_case")
        return receipt(stored!.revision, stored);
      stored = {
        ...(body.snapshot as ReturnType<typeof snapshot>),
        revision: Number(body.expected_revision) + 1,
      };
      return receipt(stored.revision, stored);
    });
    const mounted = render(<CatalogReviewsPage />);
    await prepare();
    expect(bodies.map((body) => body.action)).toEqual([
      "list_catalog_cases",
      "prepare_catalog_audit",
    ]);
    expect(screen.getByText("Not saved yet", { exact: false })).toBeTruthy();
    expect(screen.getByText("ownership documents")).toBeTruthy();
    expect(screen.getByText("a".repeat(64))).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Save audit" }));
    await screen.findByText(
      "Audit saved. You can reopen it from Saved audits.",
    );
    mounted.unmount();
    state.query = "";
    // A fresh mount lists retained cases, not an in-memory recovery ID.
    const originalFetch = global.fetch;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url, init) => {
        if (JSON.parse(String(init!.body)).action === "list_catalog_cases")
          return Response.json({
            cases: [item()],
            has_more: false,
            next_id: null,
          });
        return originalFetch(url, init);
      }),
    );
    render(<CatalogReviewsPage />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Audit dddddddd/ }),
    );
    await screen.findByText("Saved audit reopened.");
    fireEvent.change(screen.getByLabelText("Add a review note"), {
      target: { value: "Request the missing ownership agreement." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save review note" }));
    await screen.findByText("Request the missing ownership agreement.");
    const saves = bodies.filter((body) => body.action === "save_catalog_case");
    expect(saves.map((body) => body.expected_revision)).toEqual([0, 1]);
    const next = saves[1].snapshot as ReturnType<typeof snapshot>;
    expect(next.scope).toBe(snapshot().scope);
    expect(next.sources).toEqual(snapshot().sources);
    expect(next.findings).toEqual(snapshot().findings);
    const added = Object.values(next.assessments).find(
      (entry) => entry.id !== "assessment:context",
    );
    expect(added).toMatchObject({
      depends_on: ["assessment:context"],
      source_refs: snapshot().assessments["assessment:context"].source_refs,
      status: "partial",
    });
    expect(bodies.every((body) => body.organization_id === organization)).toBe(
      true,
    );
  });

  it.each(["network", "server"])(
    "retries an uncertain %s save with exact payload/key and locks edits",
    async (failure) => {
      let saves = 0;
      const { bodies } = install((body) => {
        if (body.action === "list_catalog_cases") return emptyPage;
        if (body.action === "prepare_catalog_audit") return prepared();
        if (++saves === 1) {
          if (failure === "network") throw new TypeError("response lost");
          return new Response(null, { status: 503 });
        }
        return receipt();
      });
      render(<CatalogReviewsPage />);
      await prepare();
      fireEvent.click(screen.getByRole("button", { name: "Save audit" }));
      const retry = await screen.findByRole("button", {
        name: "Retry exact save",
      });
      expect(screen.queryByLabelText("Add a review note")).toBeNull();
      fireEvent.click(retry);
      fireEvent.click(retry);
      await screen.findByText(
        "Audit saved. You can reopen it from Saved audits.",
      );
      const savedBodies = bodies.filter(
        (body) => body.action === "save_catalog_case",
      );
      expect(savedBodies).toHaveLength(2);
      expect(savedBodies[1]).toEqual(savedBodies[0]);
    },
  );

  it("replaces prior protected content with a redacted receipt and disables writes", async () => {
    let reads = 0;
    install((body) => {
      if (body.action === "list_catalog_cases")
        return { cases: [item()], has_more: false, next_id: null };
      if (++reads === 1) return receipt();
      return {
        ...receipt(),
        state: "partial",
        snapshot_usable_for_save: false,
        withheld_record_ids: [
          "source:context",
          "assessment:context",
          "finding:retained",
        ],
        snapshot: {
          ...snapshot(1),
          sources: {
            "source:context": {
              id: "source:context",
              version: versionId,
              status: "withdrawn",
              withheld: true,
            },
          },
          assessments: {
            "assessment:context": {
              id: "assessment:context",
              status: "partial",
              stale: true,
              withheld: true,
            },
          },
          findings: {
            "finding:retained": {
              id: "finding:retained",
              status: "open",
              stale: true,
              withheld: true,
            },
          },
        },
      };
    });
    render(<CatalogReviewsPage />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Audit dddddddd/ }),
    );
    await screen.findByText(
      snapshot().assessments["assessment:context"].summary,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reopen saved audit" }));
    await screen.findByText(
      "Some evidence is no longer available. Protected content is withheld and this audit is read-only.",
    );
    expect(
      screen.queryByText(snapshot().assessments["assessment:context"].summary),
    ).toBeNull();
    expect(screen.queryByText("a".repeat(64))).toBeNull();
    expect(screen.queryByLabelText("Add a review note")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Save review note" }),
    ).toBeNull();
  });

  it("requires re-read after conflict, uses returned revision, and discards the old draft", async () => {
    const { bodies } = install((body) => {
      if (body.action === "list_catalog_cases") return emptyPage;
      if (body.action === "prepare_catalog_audit") return prepared();
      if (body.action === "read_catalog_case") return receipt(4);
      return new Response(null, { status: 409 });
    });
    render(<CatalogReviewsPage />);
    await prepare();
    fireEvent.click(screen.getByRole("button", { name: "Save audit" }));
    await screen.findByText(
      "The save could not be confirmed; the audit may have changed. Reopen the latest saved version or retry the exact save.",
    );
    expect(screen.queryByText("Assessment summary")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reopen saved audit" }));
    await screen.findByText("Saved audit reopened.");
    fireEvent.change(screen.getByLabelText("Add a review note"), {
      target: { value: "Fresh review" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save review note" }));
    await waitFor(() =>
      expect(
        bodies.filter((body) => body.action === "save_catalog_case"),
      ).toHaveLength(2),
    );
    expect(bodies.at(-1)?.expected_revision).toBe(4);
  });

  it("paginates saved reviews with the returned opaque cursor", async () => {
    const { bodies } = install((body) =>
      body.after_id
        ? { cases: [item(secondId)], has_more: false, next_id: null }
        : { cases: [item()], has_more: true, next_id: caseId },
    );
    state.query = "";
    render(<CatalogReviewsPage />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Load more audits" }),
    );
    await screen.findByRole("button", { name: /Audit eeeeeeee/ });
    expect(screen.getByRole("button", { name: /Audit dddddddd/ })).toBeTruthy();
    expect(bodies[1].after_id).toBe(caseId);
  });
});

describe("workspace and response boundaries", () => {
  it.each(["signed-out", "unresolved", "wrong-workspace", "missing-workspace"])(
    "makes no calls for %s",
    async (mode) => {
      const { fetcher } = install(() => emptyPage);
      if (mode === "signed-out") state.authenticated = false;
      if (mode === "unresolved") state.initialized = false;
      if (mode === "wrong-workspace") state.organizationId = null;
      if (mode === "missing-workspace") state.query = `assessment=${brief}`;
      render(<CatalogReviewsPage />);
      await Promise.resolve();
      expect(fetcher).not.toHaveBeenCalled();
      expect(state.token).not.toHaveBeenCalled();
    },
  );

  it.each(["actor", "workspace", "connection", "sign-out"])(
    "clears displayed evidence synchronously on %s change",
    async (mode) => {
      install((body) =>
        body.action === "list_catalog_cases" ? emptyPage : prepared(),
      );
      const view = render(<CatalogReviewsPage />);
      await prepare();
      if (mode === "actor") state.userId = "privy:other";
      if (mode === "workspace") state.organizationId = null;
      if (mode === "connection") state.api = "https://changed.example";
      if (mode === "sign-out") state.authenticated = false;
      view.rerender(<CatalogReviewsPage />);
      expect(screen.queryByText("Assessment summary")).toBeNull();
    },
  );

  it("does not fetch when a pending token resolves after sign-out", async () => {
    let resolve!: (value: string) => void;
    state.token.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const { fetcher } = install(() => emptyPage);
    const view = render(<CatalogReviewsPage />);
    state.authenticated = false;
    view.rerender(<CatalogReviewsPage />);
    resolve("token");
    await Promise.resolve();
    await Promise.resolve();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("discards and aborts a prepared response after workspace change", async () => {
    let resolve!: (value: unknown) => void;
    let aborted: AbortSignal | undefined;
    install((body) =>
      body.action === "list_catalog_cases"
        ? emptyPage
        : new Promise((done) => {
            resolve = done;
          }),
    );
    const original = global.fetch;
    vi.stubGlobal(
      "fetch",
      vi.fn((url, init) => {
        if (JSON.parse(String(init?.body)).action === "prepare_catalog_audit")
          aborted = init!.signal as AbortSignal;
        return original(url, init);
      }),
    );
    const view = render(<CatalogReviewsPage />);
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Prepare audit",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "Prepare audit" }));
    await waitFor(() => expect(resolve).toBeTypeOf("function"));
    state.organizationId = null;
    view.rerender(<CatalogReviewsPage />);
    resolve(prepared());
    await Promise.resolve();
    await Promise.resolve();
    expect(aborted?.aborted).toBe(true);
    expect(screen.queryByText("Assessment summary")).toBeNull();
  });

  it.each(["workspace", "case", "revision", "malformed", "source"])(
    "fails closed on a %s-mismatched receipt",
    async (mismatch) => {
      install((body) => {
        if (body.action === "list_catalog_cases")
          return { cases: [item()], has_more: false, next_id: null };
        const bad = receipt();
        if (mismatch === "workspace") bad.snapshot.workspace_id = account;
        if (mismatch === "case") bad.case_id = secondId;
        if (mismatch === "revision") bad.snapshot.revision = 9;
        if (mismatch === "source")
          bad.snapshot.sources["source:context"].sha256 = "fake";
        return mismatch === "malformed" ? { snapshot: "invalid" } : bad;
      });
      render(<CatalogReviewsPage />);
      fireEvent.click(
        await screen.findByRole("button", { name: /Audit dddddddd/ }),
      );
      await screen.findByText(
        "The audit could not be verified. Reopen it before continuing.",
      );
      expect(screen.queryByText("Assessment summary")).toBeNull();
      expect(screen.queryByLabelText("Add a review note")).toBeNull();
    },
  );
});

it.each(["malformed-json", "foreign-workspace", "wrong-revision", "409"])(
  "retains the exact write after ambiguous %s response and failed recovery",
  async (failure) => {
    let saveCount = 0;
    const { bodies } = install((body) => {
      if (body.action === "list_catalog_cases")
        return { cases: [item(secondId)], has_more: false, next_id: null };
      if (body.action === "prepare_catalog_audit") return prepared();
      if (body.action === "read_catalog_case")
        return new Response(null, { status: 409 });
      if (++saveCount === 1) {
        if (failure === "malformed-json")
          return new Response("{broken", { status: 200 });
        if (failure === "409") return new Response(null, { status: 409 });
        const invalid = receipt();
        if (failure === "foreign-workspace")
          invalid.snapshot.workspace_id = account;
        else invalid.revision = 12;
        return invalid;
      }
      return receipt();
    });
    render(<CatalogReviewsPage />);
    await prepare();
    fireEvent.click(screen.getByRole("button", { name: "Save audit" }));
    await screen.findByRole("button", { name: "Retry exact save" });
    expect(screen.queryByText("Assessment summary")).toBeNull();
    expect(
      (
        screen.getByRole("button", {
          name: /Audit eeeeeeee/,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Reopen saved audit" }));
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Retry exact save",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry exact save" }));
    await screen.findByText(
      "Audit saved. You can reopen it from Saved audits.",
    );
    const writes = bodies.filter((body) => body.action === "save_catalog_case");
    expect(writes).toHaveLength(2);
    expect(writes[1]).toEqual(writes[0]);
  },
);

it("keeps unrelated portable cases viewable without offering unsupported writes", async () => {
  install((body) => {
    if (body.action === "list_catalog_cases")
      return { cases: [item()], has_more: false, next_id: null };
    const legacy = snapshot(1);
    const original = legacy.assessments["assessment:context"];
    return receipt(1, {
      ...legacy,
      assessments: {
        "assessment:other": {
          ...original,
          id: "assessment:other",
          rule_version: "other-workflow-v1",
        },
      },
    });
  });
  render(<CatalogReviewsPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: /Audit dddddddd/ }),
  );
  await screen.findByText(
    "This saved case uses a different review workflow. You can read it here, but notes are disabled.",
  );
  expect(
    screen.getByText(snapshot().assessments["assessment:context"].summary),
  ).toBeTruthy();
  expect(screen.queryByLabelText("Add a review note")).toBeNull();
});

it("survives StrictMode effect replay without losing the initial list", async () => {
  install(() => ({ cases: [item()], has_more: false, next_id: null }));
  render(
    <React.StrictMode>
      <CatalogReviewsPage />
    </React.StrictMode>,
  );
  await screen.findByRole("button", { name: /Audit dddddddd/ });
  expect(
    screen.queryByText(
      "The audit could not be verified. Reopen it before continuing.",
    ),
  ).toBeNull();
});

it.each(["absent", "altered", "confirmed", "redacted", "auth-loss"])(
  "handles an unconfirmed note that is %s on readback without auto-saving",
  async (mode) => {
    let submitted: ReturnType<typeof snapshot> | undefined;
    let reads = 0;
    const text = "Unconfirmed private review note";
    const { bodies } = install((body) => {
      if (body.action === "list_catalog_cases")
        return { cases: [item()], has_more: false, next_id: null };
      if (body.action === "save_catalog_case") {
        submitted = body.snapshot as ReturnType<typeof snapshot>;
        return new Response(null, { status: 409 });
      }
      if (++reads === 1) return receipt();
      if (mode === "auth-loss") return new Response(null, { status: 403 });
      if (mode === "redacted")
        return {
          ...receipt(2),
          state: "partial",
          snapshot_usable_for_save: false,
          withheld_record_ids: [
            "source:context",
            "assessment:context",
            "finding:retained",
          ],
          snapshot: {
            ...snapshot(2),
            sources: {
              "source:context": {
                id: "source:context",
                version: versionId,
                status: "withdrawn",
                withheld: true,
              },
            },
            assessments: {
              "assessment:context": {
                id: "assessment:context",
                status: "partial",
                stale: true,
                withheld: true,
              },
            },
            findings: {
              "finding:retained": {
                id: "finding:retained",
                status: "open",
                stale: true,
                withheld: true,
              },
            },
          },
        };
      if (mode === "altered")
        return receipt(2, {
          ...submitted!,
          revision: 2,
          assessments: Object.fromEntries(
            Object.entries(submitted!.assessments).map(([id, entry]) => [
              id,
              id === "assessment:context"
                ? entry
                : { ...entry, summary: "A different saved note" },
            ]),
          ),
        });
      return mode === "confirmed"
        ? receipt(2, { ...submitted!, revision: 2 })
        : receipt(2);
    });
    render(<CatalogReviewsPage />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Audit dddddddd/ }),
    );
    await screen.findByText("Saved audit reopened.");
    fireEvent.change(screen.getByLabelText("Add a review note"), {
      target: { value: text },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save review note" }));
    await screen.findByRole("button", { name: "Retry exact save" });
    fireEvent.click(screen.getByRole("button", { name: "Reopen saved audit" }));
    if (mode === "absent" || mode === "altered") {
      await screen.findByText(
        "A newer saved revision is open. Your unconfirmed note is restored below for review; it has not been saved to this revision. Check the latest evidence before saving it again.",
      );
      expect(
        (screen.getByLabelText("Add a review note") as HTMLTextAreaElement)
          .value,
      ).toBe(text);
      expect(
        bodies.filter((body) => body.action === "save_catalog_case"),
      ).toHaveLength(1);
      fireEvent.click(screen.getByRole("button", { name: "Save review note" }));
      await screen.findByRole("button", { name: "Retry exact save" });
      const saves = bodies.filter(
        (body) => body.action === "save_catalog_case",
      );
      expect(saves[1].expected_revision).toBe(2);
      expect(saves[1].idempotency_key).not.toBe(saves[0].idempotency_key);
    } else if (mode === "confirmed") {
      await screen.findByText(
        "Saved audit reopened. Your review note is confirmed in this revision.",
      );
      expect(screen.getByText(text)).toBeTruthy();
      expect(
        (screen.getByLabelText("Add a review note") as HTMLTextAreaElement)
          .value,
      ).toBe("");
    } else {
      await screen.findByText(
        mode === "redacted"
          ? "Some evidence is no longer available. Protected content is withheld and this audit is read-only."
          : "This audit or its evidence is unavailable in this workspace.",
      );
      expect(screen.queryByLabelText("Add a review note")).toBeNull();
      expect(screen.queryByText(text)).toBeNull();
    }
    if (mode !== "absent" && mode !== "altered")
      expect(
        bodies.filter((body) => body.action === "save_catalog_case"),
      ).toHaveLength(1);
  },
);

it.each(["removed", "version", "fingerprint", "context-version", "assessment"])(
  "discards private draft when a newer usable case changes its %s dependency",
  async (change) => {
    let reads = 0;
    const privateText = "Private note derived from original evidence";
    const { bodies } = install((body) => {
      if (body.action === "list_catalog_cases")
        return { cases: [item()], has_more: false, next_id: null };
      if (body.action === "save_catalog_case")
        return new Response(null, { status: 409 });
      if (++reads === 1) return receipt();
      const newer = snapshot(2);
      if (change === "removed")
        return receipt(2, {
          ...newer,
          sources: {},
          findings: {},
          assessments: {
            "assessment:context": {
              ...newer.assessments["assessment:context"],
              source_refs: [],
              evidence_gap: "Original source is no longer retained.",
            },
          },
        });
      if (change === "version") {
        newer.sources["source:context"].version = secondId;
        newer.assessments["assessment:context"].source_refs[0].version =
          secondId;
      }
      if (change === "fingerprint")
        newer.sources["source:context"].sha256 = "b".repeat(64);
      if (change === "context-version")
        newer.sources["source:context"].context_source_version_id = secondId;
      if (change === "assessment")
        newer.assessments["assessment:context"].summary =
          "A replacement assessment";
      return receipt(2, newer);
    });
    render(<CatalogReviewsPage />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Audit dddddddd/ }),
    );
    await screen.findByText("Saved audit reopened.");
    fireEvent.change(screen.getByLabelText("Add a review note"), {
      target: { value: privateText },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save review note" }));
    await screen.findByRole("button", { name: "Retry exact save" });
    fireEvent.click(screen.getByRole("button", { name: "Reopen saved audit" }));
    await screen.findByText(
      "The saved audit’s evidence changed. Your unconfirmed draft was discarded because its original evidence is no longer retained unchanged.",
    );
    expect(
      (screen.getByLabelText("Add a review note") as HTMLTextAreaElement).value,
    ).toBe("");
    expect(screen.queryByText(privateText)).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Retry exact save" }),
    ).toBeNull();
    expect(
      bodies.filter((body) => body.action === "save_catalog_case"),
    ).toHaveLength(1);
  },
);
