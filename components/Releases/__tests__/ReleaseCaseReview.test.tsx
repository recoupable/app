// @vitest-environment jsdom
import { render, item, projection } from "./setup";
import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ReleaseCasesPage from "../ReleaseCasesPage";
it("reviews the exact observed fingerprint and does not authorize distribution", async () => {
  const bodies: Record<string, unknown>[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      const body = JSON.parse(init.body);
      bodies.push(body);
      return Response.json(
        body.action === "list_release_cases"
          ? { cases: [item], has_more: false }
          : body.action === "review_release_case"
            ? { id: "review", state: "saved" }
            : projection,
      );
    }),
  );
  render(<ReleaseCasesPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: /Open saved release/ }),
  );
  expect(await screen.findByText("Fixture release")).toBeTruthy();
  expect(screen.getByText("Missing composition")).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Mark metadata reviewed" }),
  );
  await waitFor(() =>
    expect(
      bodies.find((x) => x.action === "review_release_case"),
    ).toMatchObject({
      fingerprint: "a".repeat(64),
      organization_id: "org-a",
      decision: "reviewed",
    }),
  );
  expect(
    screen.queryByRole("button", { name: /distribute|register rights/i }),
  ).toBeNull();
});

it("does not allow a review of a truncated release", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) =>
      Response.json(
        JSON.parse(init.body).action === "list_release_cases"
          ? { cases: [item] }
          : {
              ...projection,
              reviewable: false,
              track_page: { hasMore: true },
            },
      ),
    ),
  );
  render(<ReleaseCasesPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: /Open saved release/ }),
  );
  await screen.findByText("Fixture release");
  expect(
    (
      screen.getByRole("button", {
        name: "Mark metadata reviewed",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});
