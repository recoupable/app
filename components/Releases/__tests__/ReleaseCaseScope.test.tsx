// @vitest-environment jsdom
import { state, item, projection } from "./setup";
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ReleaseCasesPage from "../ReleaseCasesPage";
it("immediately hides private case content on workspace switch", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      const body = JSON.parse(init.body);
      return Response.json(
        body.action === "list_release_cases"
          ? {
              cases: body.organization_id === "org-a" ? [item] : [],
              has_more: false,
            }
          : projection,
      );
    }),
  );
  const { rerender } = render(<ReleaseCasesPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: /Open saved release/ }),
  );
  await screen.findByText("Fixture release");
  state.org = "org-b";
  await act(async () => {
    rerender(<ReleaseCasesPage />);
  });
  expect(screen.queryByText("Fixture release")).toBeNull();
  await screen.findByText("No saved releases yet.");
  expect(
    screen.queryByRole("button", { name: /Open saved release/ }),
  ).toBeNull();
});

it("ignores an old workspace response arriving after a switch", async () => {
  let finishOldRead!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      const body = JSON.parse(init.body);
      if (body.action === "read_release_case")
        return new Promise<Response>((resolve) => {
          finishOldRead = resolve;
        });
      return Response.json({
        cases: body.organization_id === "org-a" ? [item] : [],
        has_more: false,
      });
    }),
  );
  const { rerender } = render(<ReleaseCasesPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: /Open saved release/ }),
  );
  await waitFor(() => expect(finishOldRead).toBeDefined());
  state.org = "org-b";
  await act(async () => {
    rerender(<ReleaseCasesPage />);
  });
  await screen.findByText("No saved releases yet.");
  await act(async () => {
    finishOldRead(Response.json(projection));
  });
  await waitFor(() => expect(screen.queryByText("Fixture release")).toBeNull());
});
