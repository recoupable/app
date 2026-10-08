// @vitest-environment jsdom
import { item, state } from "./setup";
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ReleaseCasesPage from "../ReleaseCasesPage";

it("saves a workspace-scoped locator without collecting metadata", async () => {
  const bodies: Record<string, unknown>[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      const body = JSON.parse(init.body);
      bodies.push(body);
      return Response.json(
        body.action === "ingest_release"
          ? { request: { id: "request", status: "partial" } }
          : {
              cases: bodies.some(
                (x) =>
                  x.action === "ingest_release" &&
                  x.organization_id === body.organization_id,
              )
                ? [item]
                : [],
            },
      );
    }),
  );
  const { rerender } = render(<ReleaseCasesPage />);
  await screen.findByText("No saved releases yet.");
  fireEvent.change(screen.getByLabelText("Spotify release URL"), {
    target: { value: item.url },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add release URL" }));
  await screen.findByText(
    "Release URL saved. Metadata has not been collected by this action.",
  );
  expect(bodies.map((x) => x.action)).toEqual([
    "list_release_cases",
    "ingest_release",
    "list_release_cases",
  ]);
  expect(bodies[1]).toMatchObject({
    url: item.url,
    organization_id: "org-a",
    idempotency_key: expect.any(String),
  });
  state.org = "org-b";
  await act(async () => {
    rerender(<ReleaseCasesPage />);
  });
  expect(
    (screen.getByLabelText("Spotify release URL") as HTMLInputElement).value,
  ).toBe("");
  expect(
    screen.queryByText(
      "Release URL saved. Metadata has not been collected by this action.",
    ),
  ).toBeNull();
  await screen.findByText("No saved releases yet.");
  expect(screen.queryByText(item.url)).toBeNull();
});
