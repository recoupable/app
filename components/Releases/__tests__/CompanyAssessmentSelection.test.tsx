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
async function open() {
  fireEvent.change(screen.getByLabelText("Saved assessment ID"), {
    target: { value: id(1) },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Open saved assessment" }),
  );
  await screen.findByText("Saved assessment reopened.");
}
function capture() {
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  fireEvent.click(
    screen.getByRole("button", { name: "Capture selection locally" }),
  );
}
it("captures the accepted brief, not edited input or current request, without dispatching", async () => {
  const fetcher = vi.fn(async () => Response.json({ snapshot }));
  vi.stubGlobal("fetch", fetcher);
  render(<CompanyAssessment {...props} />);
  await open();
  fireEvent.change(screen.getByLabelText("Saved assessment ID"), {
    target: { value: id(777) },
  });
  capture();
  const payload = JSON.parse(
    (
      screen.getByLabelText(
        "Captured evidence references",
      ) as HTMLTextAreaElement
    ).value,
  );
  expect(payload.brief_id).toBe(id(1));
  expect(payload.selected_evidence[0].documentId).toBe(id(10));
  expect(JSON.stringify(payload)).not.toContain(id(999));
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(
    screen.getByText(
      "1 evidence document captured locally. Not saved or sent to chat.",
    ),
  ).toBeTruthy();
});
it("clears capture at request start while old evidence is still displayed", async () => {
  let finish!: (response: Response) => void;
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
  render(<CompanyAssessment {...props} />);
  await open();
  capture();
  fireEvent.click(
    screen.getByRole("button", { name: "Open saved assessment" }),
  );
  expect(screen.queryByLabelText("Captured evidence references")).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: "Capture selection locally",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  await act(async () => finish(Response.json({ snapshot })));
  expect(screen.queryByLabelText("Captured evidence references")).toBeNull();
  expect(screen.getByText("0 documents selected locally.")).toBeTruthy();
});
it("enforces eight selections, clears capture on edits and scope leave-return", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ snapshot })),
  );
  const view = render(<CompanyAssessment {...props} />);
  await open();
  const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
  boxes.slice(0, 8).forEach((box) => fireEvent.click(box));
  expect(boxes[8].disabled).toBe(true);
  fireEvent.click(
    screen.getByRole("button", { name: "Capture selection locally" }),
  );
  expect(screen.getByLabelText("Captured evidence references")).toBeTruthy();
  fireEvent.click(boxes[0]);
  expect(screen.queryByLabelText("Captured evidence references")).toBeNull();
  view.rerender(<CompanyAssessment {...props} organizationId={id(997)} />);
  view.rerender(<CompanyAssessment {...props} />);
  expect(screen.queryByRole("checkbox")).toBeNull();
  expect(screen.getByText("0 documents selected locally.")).toBeTruthy();
});
it.each([true, undefined])(
  "keeps superseded %s snapshots readable but unavailable for capture",
  async (superseded) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ snapshot: { ...snapshot, superseded } }),
      ),
    );
    render(<CompanyAssessment {...props} />);
    fireEvent.change(screen.getByLabelText("Saved assessment ID"), {
      target: { value: id(1) },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Open saved assessment" }),
    );
    await screen.findByText("Synthetic evidence summary");
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(
      (
        screen.getByRole("button", {
          name: "Capture selection locally",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  },
);
