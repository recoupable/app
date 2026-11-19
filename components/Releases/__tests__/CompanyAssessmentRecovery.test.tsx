// @vitest-environment jsdom
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CompanyAssessment from "../CompanyAssessment";
import { captureAssessmentEvidence } from "@/lib/releases/assessmentEvidence/captureAssessmentEvidence";
import {
  id,
  snapshot,
} from "@/lib/releases/assessmentEvidence/__tests__/assessmentFixture";
const props = {
  requestId: id(999),
  organizationId: id(998),
  getAccessToken: async () => "synthetic",
};
const reference = captureAssessmentEvidence(snapshot, [id(10)])!;
const available = {
  snapshot,
  evidence_validation: {
    state: "available",
    documents: [
      {
        documentId: id(10),
        subjectId: id(50),
        sourceVersionIds: [id(70)],
        kind: "material",
        identityConfirmed: true,
      },
    ],
  },
};
afterEach(() => vi.unstubAllGlobals());
async function open() {
  const view = render(<CompanyAssessment {...props} />);
  fireEvent.change(screen.getByLabelText("Saved assessment ID"), {
    target: { value: snapshot.id },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Open saved assessment" }),
  );
  await screen.findByText("Saved assessment reopened.");
  return view;
}
function recover(value = JSON.stringify(reference)) {
  fireEvent.change(screen.getByLabelText("References to recover"), {
    target: { value },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Recover and check exact evidence" }),
  );
}
it("recovers serialized capture after unmount and rechecks exact versions with current authority", async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockImplementation(async (_url, init) => {
      const body = JSON.parse(init!.body as string);
      return Response.json(body.selected_evidence ? available : { snapshot });
    });
  vi.stubGlobal("fetch", fetcher);
  const first = await open();
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  fireEvent.click(
    screen.getByRole("button", { name: "Capture selection locally" }),
  );
  const serialized = (
    screen.getByLabelText("Captured evidence references") as HTMLTextAreaElement
  ).value;
  first.unmount();
  await open();
  expect(screen.queryByRole("list", { name: "Checked evidence" })).toBeNull();
  recover(serialized);
  await screen.findByRole("list", { name: "Checked evidence" });
  expect(JSON.parse(fetcher.mock.calls[2][1]!.body as string)).toEqual({
    action: "read_brief",
    ...reference,
    explain_evidence_validation: true,
    organization_id: props.organizationId,
  });
  expect(fetcher.mock.calls[2][1]).toMatchObject({
    cache: "no-store",
    headers: { Authorization: "Bearer synthetic" },
  });
  expect(fetcher).toHaveBeenCalledTimes(3);
});
it.each(["malformed", "other-brief", "extra-field", "missing-version"])(
  "rejects %s without a lookup",
  async (mode) => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json({ snapshot }),
    );
    vi.stubGlobal("fetch", fetcher);
    await open();
    const value = structuredClone(reference);
    if (mode === "other-brief") value.brief_id = id(800);
    if (mode === "missing-version")
      delete (
        value.selected_evidence[0] as Partial<
          (typeof value.selected_evidence)[0]
        >
      ).version;
    recover(
      mode === "malformed"
        ? "{"
        : JSON.stringify(
            mode === "extra-field"
              ? { ...value, url: "https://example.invalid" }
              : value,
          ),
    );
    await screen.findByText(/References could not be recovered/);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("list", { name: "Checked evidence" })).toBeNull();
  },
);
it.each(["denied", "revoked", "superseded", "mismatched", "malformed"])(
  "withholds recovered evidence on %s without fallback",
  async (mode) => {
    const response =
      mode === "denied"
        ? new Response(null, { status: 403 })
        : Response.json(
            mode === "revoked"
              ? {
                  snapshot,
                  evidence_validation: {
                    state: "unavailable",
                    reason: "current_evidence_unavailable",
                  },
                }
              : mode === "malformed"
                ? { snapshot }
                : {
                    ...available,
                    snapshot: {
                      ...snapshot,
                      ...(mode === "superseded"
                        ? { superseded: true }
                        : { id: id(800) }),
                    },
                  },
          );
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ snapshot }))
      .mockResolvedValueOnce(response);
    vi.stubGlobal("fetch", fetcher);
    await open();
    recover();
    await screen.findByText(
      mode === "revoked"
        ? /could not be matched to current evidence/
        : /Could not verify captured evidence/,
    );
    expect(screen.queryByRole("list", { name: "Checked evidence" })).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.every(([url]) => url === "/api/context")).toBe(
      true,
    );
  },
);
it.each(["edit", "workspace"])(
  "discards delayed recovery after %s",
  async (mode) => {
    let finish!: (response: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(Response.json({ snapshot }))
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              finish = resolve;
            }),
        ),
    );
    const view = await open();
    recover();
    await waitFor(() => expect(finish).toBeTypeOf("function"));
    if (mode === "edit")
      fireEvent.change(screen.getByLabelText("References to recover"), {
        target: { value: "{" },
      });
    else
      view.rerender(<CompanyAssessment {...props} organizationId={id(997)} />);
    await act(async () => finish(Response.json(available)));
    expect(screen.queryByRole("list", { name: "Checked evidence" })).toBeNull();
    expect(screen.queryByText(/Captured evidence was available/)).toBeNull();
  },
);
