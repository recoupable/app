// @vitest-environment jsdom
import { render, state, item, projection } from "./setup";
import React from "react";
import { act, fireEvent, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ReleaseCasesPage from "../ReleaseCasesPage";
it("shows a failed read as an error rather than an empty release", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ error: "Unavailable" }, { status: 409 })),
  );
  render(<ReleaseCasesPage />);
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.queryByText("No saved releases yet.")).toBeNull();
});

it("does not load private data when signed out", async () => {
  state.authenticated = false;
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await act(async () => {
    render(<ReleaseCasesPage />);
  });
  expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
  expect(fetcher).not.toHaveBeenCalled();
});

it("hides a previously loaded case after access or evidence read failure", async () => {
  let denied = false;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      if (denied)
        return Response.json({ error: "Unavailable" }, { status: 403 });
      return Response.json(
        JSON.parse(init.body).action === "list_release_cases"
          ? { cases: [item] }
          : projection,
      );
    }),
  );
  render(<ReleaseCasesPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: /Open saved release/ }),
  );
  await screen.findByText("Fixture release");
  denied = true;
  fireEvent.click(screen.getByRole("button", { name: "Reload case" }));
  await screen.findByRole("alert");
  expect(screen.queryByText("Fixture release")).toBeNull();
});
