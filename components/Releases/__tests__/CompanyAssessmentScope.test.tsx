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
const getAccessToken = async () => "token";
const brief = {
  purpose: "company_onboarding",
  text: "Old scope evidence",
  readiness: "partial",
  missingTopics: [],
  guidance: "Saved assertions are unverified.",
};
const response = () =>
  Response.json({
    snapshot: { id: "old-snapshot", state: "saved", superseded: false, brief },
  });
afterEach(() => vi.unstubAllGlobals());
it.each(["request", "organization"])(
  "forgets accepted snapshot and input when the %s changes and returns",
  async (scope) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response()),
    );
    const initial = {
      requestId: "request-a",
      organizationId: "org-a",
      getAccessToken,
    };
    const view = render(<CompanyAssessment {...initial} />);
    fireEvent.change(screen.getByLabelText("Saved assessment ID"), {
      target: { value: "old-snapshot" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Open saved assessment" }),
    );
    await screen.findByText("Saved assessment: old-snapshot");
    view.rerender(
      <CompanyAssessment
        {...initial}
        requestId={scope === "request" ? "request-b" : "request-a"}
        organizationId={scope === "organization" ? "org-b" : "org-a"}
      />,
    );
    expect(screen.queryByText(brief.text)).toBeNull();
    expect(
      (screen.getByLabelText("Saved assessment ID") as HTMLInputElement).value,
    ).toBe("");
    view.rerender(<CompanyAssessment {...initial} />);
    expect(screen.queryByText("Saved assessment: old-snapshot")).toBeNull();
    expect(screen.queryByText(brief.text)).toBeNull();
  },
);
it("ignores a delayed read after scope changes, even after returning", async () => {
  let settle!: (value: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          settle = resolve;
        }),
    ),
  );
  const initial = {
    requestId: "request-a",
    organizationId: "org-a",
    getAccessToken,
  };
  const view = render(<CompanyAssessment {...initial} />);
  fireEvent.change(screen.getByLabelText("Saved assessment ID"), {
    target: { value: "old-snapshot" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Open saved assessment" }),
  );
  await waitFor(() => expect(settle).toBeTypeOf("function"));
  view.rerender(<CompanyAssessment {...initial} organizationId="org-b" />);
  view.rerender(<CompanyAssessment {...initial} />);
  await act(async () => settle(response()));
  expect(screen.queryByText(brief.text)).toBeNull();
  expect(screen.queryByText("Saved assessment reopened.")).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: "Preview assessment",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
});
it("does not dispatch after token resolution if its scope was removed", async () => {
  let settle!: (value: string) => void;
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const view = render(
    <CompanyAssessment
      requestId="request-a"
      organizationId="org-a"
      getAccessToken={() =>
        new Promise<string>((resolve) => {
          settle = resolve;
        })
      }
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Preview assessment" }));
  view.rerender(
    <CompanyAssessment
      requestId="request-b"
      organizationId="org-a"
      getAccessToken={getAccessToken}
    />,
  );
  await act(async () => settle("token"));
  expect(fetcher).not.toHaveBeenCalled();
  expect(screen.queryByText(brief.text)).toBeNull();
});
