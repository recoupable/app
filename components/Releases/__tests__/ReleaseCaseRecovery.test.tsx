// @vitest-environment jsdom
import { state } from "./setup";
import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ReleaseCasesPage from "../ReleaseCasesPage";
it("offers a route back to chat when no saved releases exist", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ cases: [] })),
  );
  render(<ReleaseCasesPage />);
  await screen.findByText("No saved releases yet.");
  expect(
    screen.getByRole("link", { name: "Open chat" }).getAttribute("href"),
  ).toBe("/");
});

it("identifies expired authentication without exposing raw response errors", async () => {
  state.token = null;
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  render(<ReleaseCasesPage />);
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Please sign in again.",
  );
  expect(fetcher).not.toHaveBeenCalled();
});

it.each([null, "<html>Sign in</html>"])(
  "recovers from a non-JSON 401 response (%s)",
  async (body) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(body, { status: 401 })),
    );
    render(<ReleaseCasesPage />);
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Please sign in again.",
    );
  },
);
