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
import {
  id,
  snapshot,
} from "@/lib/releases/assessmentEvidence/__tests__/assessmentFixture";
afterEach(() => vi.unstubAllGlobals());
const props = {
  requestId: id(999),
  organizationId: id(998),
  getAccessToken: async () => "token",
};
const available = () => ({
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
});
async function setup(getAccessToken = props.getAccessToken) {
  const view = render(
    <CompanyAssessment {...props} getAccessToken={getAccessToken} />,
  );
  fireEvent.change(screen.getByLabelText("Saved assessment ID"), {
    target: { value: id(1) },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Open saved assessment" }),
  );
  await screen.findByText("Saved assessment reopened.");
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  fireEvent.click(
    screen.getByRole("button", { name: "Capture selection locally" }),
  );
  return view;
}
function check() {
  fireEvent.click(
    screen.getByRole("button", { name: "Check captured evidence" }),
  );
}
it("sends only explicit read_brief with captured id, selection and current org", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ snapshot }))
    .mockResolvedValueOnce(Response.json(available()));
  vi.stubGlobal("fetch", fetcher);
  await setup();
  expect(fetcher).toHaveBeenCalledTimes(1);
  check();
  await screen.findByText(/Captured evidence was available/);
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({
    action: "read_brief",
    explain_evidence_validation: true,
    brief_id: id(1),
    selected_evidence: [snapshot.brief!.input_manifest!.documents[0]],
    organization_id: id(998),
  });
  expect(
    screen.getByRole("list", { name: "Checked evidence" }).textContent,
  ).toContain("material");
});
it.each(["unavailable", "denied", "mismatch", "legacy"])(
  "separates %s from available",
  async (mode) => {
    const response =
      mode === "denied"
        ? new Response(null, { status: 403 })
        : Response.json(
            mode === "legacy"
              ? { snapshot }
              : mode === "unavailable"
                ? { snapshot, evidence_validation: { state: "unavailable" } }
                : { ...available(), snapshot: { ...snapshot, id: id(800) } },
          );
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ snapshot }))
        .mockResolvedValueOnce(response),
    );
    await setup();
    check();
    await screen.findByText(
      mode === "unavailable"
        ? /Captured evidence is unavailable/
        : /Could not verify captured evidence/,
    );
    expect(screen.queryByRole("list", { name: "Checked evidence" })).toBeNull();
  },
);
it.each(["edit", "clear", "capture", "operation", "scope"])(
  "discards delayed response after %s",
  async (mode) => {
    let finish!: (r: Response) => void;
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ snapshot }))
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValue(Response.json({ snapshot }));
    vi.stubGlobal("fetch", fetcher);
    const view = await setup();
    check();
    await waitFor(() => expect(finish).toBeTypeOf("function"));
    if (mode === "edit") fireEvent.click(screen.getAllByRole("checkbox")[1]);
    if (mode === "clear")
      fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    if (mode === "capture")
      fireEvent.click(
        screen.getByRole("button", { name: "Capture selection locally" }),
      );
    if (mode === "operation")
      fireEvent.click(
        screen.getByRole("button", { name: "Open saved assessment" }),
      );
    if (mode === "scope") {
      view.rerender(<CompanyAssessment {...props} organizationId={id(997)} />);
      view.rerender(<CompanyAssessment {...props} />);
    }
    await act(async () => finish(Response.json(available())));
    expect(screen.queryByText(/Captured evidence was available/)).toBeNull();
    expect(screen.queryByRole("list", { name: "Checked evidence" })).toBeNull();
  },
);
it("does not dispatch after a delayed token and selection change", async () => {
  let finish!: (token: string) => void;
  const token = vi
    .fn()
    .mockResolvedValueOnce("token")
    .mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve;
        }),
    );
  const fetcher = vi.fn(async () => Response.json({ snapshot }));
  vi.stubGlobal("fetch", fetcher);
  await setup(token);
  check();
  fireEvent.click(screen.getAllByRole("checkbox")[1]);
  await act(async () => finish("token"));
  expect(fetcher).toHaveBeenCalledTimes(1);
});

const explanations = [
  [
    "saved_assessment_unavailable",
    "The saved assessment could not be used for this check.",
  ],
  [
    "selection_mismatch",
    "The captured selection could not be matched to the saved assessment.",
  ],
  [
    "current_evidence_unavailable",
    "The selected evidence could not be matched to current evidence.",
  ],
  [
    "identity_unconfirmed",
    "The selected evidence identity could not be confirmed.",
  ],
  [
    "validation_limit_exceeded",
    "The evidence could not be checked within the validation limits.",
  ],
] as const;
it.each(explanations)(
  "explains %s without an automatic retry",
  async (reason, message) => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ snapshot }))
      .mockResolvedValueOnce(
        Response.json({
          snapshot,
          evidence_validation: { state: "unavailable", reason },
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    await setup();
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
      action: "read_brief",
      brief_id: id(1),
      organization_id: id(998),
    });
    check();
    await screen.findByText(message);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("list", { name: "Checked evidence" })).toBeNull();
  },
);
it("rejects an unknown reason instead of presenting it as authority", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(Response.json({ snapshot }))
      .mockResolvedValueOnce(
        Response.json({
          snapshot,
          evidence_validation: { state: "unavailable", reason: "withdrawn" },
        }),
      ),
  );
  await setup();
  check();
  await screen.findByText(/Could not verify captured evidence/);
  expect(screen.queryByText("withdrawn")).toBeNull();
});
it("discards a delayed explanation after recapture", async () => {
  let finish!: (r: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(Response.json({ snapshot }))
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          }),
      ),
  );
  await setup();
  check();
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  fireEvent.click(
    screen.getByRole("button", { name: "Capture selection locally" }),
  );
  await act(async () =>
    finish(
      Response.json({
        snapshot,
        evidence_validation: {
          state: "unavailable",
          reason: "identity_unconfirmed",
        },
      }),
    ),
  );
  expect(screen.queryByText(explanations[3][1])).toBeNull();
  expect(
    screen.getByText("Captured evidence has not been checked."),
  ).toBeTruthy();
});
