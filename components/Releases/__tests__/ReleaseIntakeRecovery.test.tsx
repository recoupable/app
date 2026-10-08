// @vitest-environment jsdom
import { item } from "./setup";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ReleaseCasesPage from "../ReleaseCasesPage";

it.each([503, 401, 403])(
  "acknowledges the save, hides private data and retries safely after readback %i",
  async (status) => {
    const keys: string[] = [];
    let failNextReadback = false;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        const body = JSON.parse(init.body);
        if (body.action === "ingest_release") {
          keys.push(body.idempotency_key);
          failNextReadback = keys.length === 1;
          return Response.json({
            request: { id: "request", status: "partial" },
          });
        }
        if (body.action === "list_release_cases" && failNextReadback) {
          failNextReadback = false;
          return new Response("Non-JSON failure", { status });
        }
        return Response.json({ cases: [item] });
      }),
    );
    render(<ReleaseCasesPage />);
    await screen.findByText(item.url);
    fireEvent.change(screen.getByLabelText("Spotify release URL"), {
      target: { value: item.url },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add release URL" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(
      "Release URL saved, but the list could not be refreshed.",
    );
    if (status === 401)
      expect(alert.textContent).toContain("Please sign in again.");
    expect(screen.queryByText(item.url)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Add release URL" }));
    await screen.findByText(
      "Release URL saved. Metadata has not been collected by this action.",
    );
    expect(keys).toHaveLength(2);
    expect(keys[1]).toBe(keys[0]);
    fireEvent.click(screen.getByRole("button", { name: "Add release URL" }));
    await screen.findByText(
      "Release URL saved. Metadata has not been collected by this action.",
    );
    expect(keys).toHaveLength(3);
    expect(keys[2]).not.toBe(keys[1]);
  },
);
