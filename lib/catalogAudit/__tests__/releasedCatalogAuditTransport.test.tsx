// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { POST } from "@/app/api/context/route";
import { useCatalogAudit } from "@/hooks/useCatalogAudit";
import { parsePrepared, parseReceipt, type AuditSnapshot } from "../schemas";
import fixture from "./fixtures/released-catalog-audit.json";

const api = "https://api.fixture.invalid";
vi.mock("@/lib/consts", () => ({
  NEW_API_BASE_URL: "https://api.fixture.invalid",
  API_PUBLIC_BASE_URL: "https://api.fixture.invalid",
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://api.fixture.invalid",
}));
const original = fixture.prepare.response.snapshot;
const owner = original.workspace_id;
const actor = "00000000-0000-4000-8000-000000000001";
const briefId = fixture.prepare.request.brief_id;
const emptyPage = { cases: [], has_more: false, next_id: null };
type Body = Record<string, unknown>;
function receipt(snapshot: AuditSnapshot) {
  return {
    case_id: snapshot.case_id,
    revision: snapshot.revision,
    state: "saved",
    evidence_kind: "customer_assertion",
    snapshot,
    withheld_record_ids: [],
    snapshot_usable_for_save: true,
    external_actions: "unsupported",
    created_at: "2026-11-16T00:00:00Z",
  };
}
function install(upstream: (body: Body) => unknown | Promise<unknown>) {
  const payloads: string[] = [];
  const assertionErrors: unknown[] = [];
  afterEach(() => {
    if (assertionErrors.length) throw assertionErrors[0];
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      if (url === "/api/context") {
        // Emulate the browser's same-origin POST headers, then run the real App route/proxy.
        const headers = new Headers(init.headers);
        headers.set("origin", "https://app.fixture.invalid");
        return POST(
          new Request("https://app.fixture.invalid/api/context", {
            ...init,
            headers,
          }),
        );
      }
      try {
        expect(url).toBe(`${api}/api/context`);
        expect(init.cache).toBe("no-store");
        expect(init.redirect).toBe("error");
        const headers = new Headers(init.headers);
        expect(headers.get("authorization")).toBe("Bearer synthetic-token");
        expect(headers.has("cookie")).toBe(false);
        const text = new TextDecoder().decode(init.body as ArrayBuffer);
        payloads.push(text);
        const body = JSON.parse(text) as Body;
        expect(body.organization_id).toBe(owner);
        expect(body).not.toHaveProperty("account_id");
      } catch (error) {
        assertionErrors.push(error);
        throw error;
      }
      const body = JSON.parse(
        new TextDecoder().decode(init.body as ArrayBuffer),
      ) as Body;
      const result = await upstream(body);
      return result instanceof Response ? result : Response.json(result);
    }),
  );
  return payloads;
}
function mount() {
  return renderHook(() =>
    useCatalogAudit({
      accountId: actor,
      organizationId: owner,
      apiSelection: api,
      getAccessToken: async () => "synthetic-token",
    }),
  );
}
beforeEach(() => vi.stubEnv("CONTEXT_API_URL", api));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("preserves the released schema-v1 preparation through explicit save, reopen and note continuation", async () => {
  let stored: AuditSnapshot;
  const payloads = install((body) => {
    if (body.action === "list_catalog_cases") return emptyPage;
    if (body.action === "prepare_catalog_audit")
      return fixture.prepare.response;
    if (body.action === "read_catalog_case") return receipt(stored);
    expect(body.action).toBe("save_catalog_case");
    stored = {
      ...structuredClone(body.snapshot as AuditSnapshot),
      revision: Number(body.expected_revision) + 1,
    };
    return receipt(stored);
  });
  const { result } = mount();
  await waitFor(() => expect(result.current.busy).toBe(false));
  await act(async () => {
    await result.current.prepare(briefId);
  });
  expect(result.current.snapshot).toEqual(original);
  expect(result.current.saved).toBe(false);
  expect(payloads.map((text) => JSON.parse(text).action)).toEqual([
    "list_catalog_cases",
    "prepare_catalog_audit",
  ]);
  const assessment = original.assessments["assessment:context"];
  expect(assessment.data.input_manifest.freshness.oldestRetrievedAt).toBe(
    "2026-10-21T00:00:00.000Z",
  );
  expect(assessment.data.gaps.length).toBeGreaterThan(0);
  expect(assessment.summary).toContain("Retrieved: 2026-10-21T00:00:00.000Z");
  await act(async () => {
    await result.current.save();
  });
  const firstSave = payloads
    .map((text) => JSON.parse(text))
    .find((body) => body.action === "save_catalog_case");
  expect(firstSave.snapshot).toEqual(original);
  expect(firstSave.expected_revision).toBe(0);
  await act(async () => {
    await result.current.open(original.case_id);
  });
  expect(result.current.snapshot).toEqual({ ...original, revision: 1 });
  act(() => result.current.setNote("Review the retained evidence gaps."));
  await act(async () => {
    await result.current.save();
  });
  const saves = payloads
    .map((text) => JSON.parse(text))
    .filter((body) => body.action === "save_catalog_case");
  expect(saves.map((body) => body.expected_revision)).toEqual([0, 1]);
  const continued = saves[1].snapshot as AuditSnapshot;
  expect(continued.assessments["assessment:context"]).toEqual(assessment);
  for (const name of [
    "sources",
    "findings",
    "actions",
    "attempts",
    "outcomes",
  ] as const)
    expect(continued[name]).toEqual(original[name]);
  const note = Object.values(continued.assessments).find(
    (entry) => entry.id !== "assessment:context",
  );
  expect(note).toMatchObject({
    depends_on: ["assessment:context"],
    source_refs: assessment.source_refs,
  });
  expect(
    parseReceipt(receipt(stored!), owner, original.case_id).snapshot,
  ).toEqual(result.current.snapshot);
});

it("retries the exact serialized snapshot, key and revision after an unconfirmed write through the proxy", async () => {
  let saves = 0;
  const payloads = install((body) => {
    if (body.action === "list_catalog_cases") return emptyPage;
    if (body.action === "prepare_catalog_audit")
      return fixture.prepare.response;
    expect(body.action).toBe("save_catalog_case");
    if (++saves === 1) return new Response(null, { status: 409 });
    return receipt({ ...(body.snapshot as AuditSnapshot), revision: 1 });
  });
  const { result } = mount();
  await waitFor(() => expect(result.current.busy).toBe(false));
  await act(async () => {
    await result.current.prepare(briefId);
  });
  await act(async () => {
    await result.current.save();
  });
  expect(result.current.uncertain).toBe(true);
  expect(result.current.snapshot).toBeNull();
  await act(async () => {
    await result.current.save();
  });
  const writes = payloads.filter(
    (text) => JSON.parse(text).action === "save_catalog_case",
  );
  expect(writes).toHaveLength(2);
  expect(writes[1]).toBe(writes[0]);
  expect(JSON.parse(writes[0]).snapshot).toEqual(original);
  expect(result.current.snapshot).toEqual({ ...original, revision: 1 });
  expect(result.current.uncertain).toBe(false);
});

it("preserves the released selected-evidence response separately from the preparation snapshot", async () => {
  install((body) => {
    expect(body).toEqual(fixture.selectedEvidence.request);
    return fixture.selectedEvidence.response;
  });
  const response = await fetch("/api/context", {
    method: "POST",
    headers: {
      Authorization: "Bearer synthetic-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fixture.selectedEvidence.request),
  });
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(await response.json()).toEqual(fixture.selectedEvidence.response);
});

it("accepts an equivalent mixed-case brief UUID without rewriting retained evidence", () => {
  // Derived identity variant: released storage canonicalizes UUIDs, while input accepts either case.
  const response = structuredClone(fixture.prepare.response);
  const canonical = "abcdefab-abcd-4abc-8abc-abcdefabcdef";
  response.snapshot.assessments["assessment:context"].data.brief_id = canonical;
  expect(parsePrepared(response, owner, canonical.toUpperCase())).toEqual(
    response.snapshot,
  );
  expect(() =>
    parsePrepared(response, owner, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"),
  ).toThrow("Invalid prepared audit");
});

it.each([503, 401, 403])(
  "handles list failure %s without losing drafts except on auth loss",
  async (status) => {
    let lists = 0;
    install((body) => {
      if (body.action === "list_catalog_cases")
        return ++lists === 1 ? emptyPage : new Response(null, { status });
      if (body.action === "prepare_catalog_audit")
        return fixture.prepare.response;
      return receipt({ ...(body.snapshot as AuditSnapshot), revision: 1 });
    });
    const { result } = mount();
    await waitFor(() => expect(result.current.busy).toBe(false));
    await act(async () => {
      await result.current.prepare(briefId);
    });
    await act(async () => {
      await result.current.save();
    });
    act(() => result.current.setNote("Keep this unsaved note"));
    const before = result.current.snapshot;
    await act(async () => {
      await result.current.open(original.case_id);
    });
    expect(result.current.snapshot).toEqual(before);
    expect(result.current.note).toBe("Keep this unsaved note");
    expect(result.current.notice).toContain("Save or clear your unsaved note");
    await act(async () => {
      await result.current.loadList();
    });
    expect(result.current.snapshot).toEqual(status === 503 ? before : null);
    expect(result.current.note).toBe(
      status === 503 ? "Keep this unsaved note" : "",
    );
  },
);
