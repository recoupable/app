// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import { MessageParts } from "@/components/VercelChat/MessageParts";
import { catalogStreamComparisonFixture as fixture } from "@/lib/catalog/__tests__/catalogStreamComparisonFixture";

afterEach(cleanup);

it.each([true, false])(
  "renders saved comparisons in chat, dynamic=%s",
  (dynamic) => {
    const message = {
      id: "synthetic-comparison",
      role: "assistant",
      parts: [
        {
          type: dynamic ? "dynamic-tool" : "tool-get_catalog_streams",
          toolName: "get_catalog_streams",
          toolCallId: "comparison",
          state: "output-available",
          input: {},
          output: dynamic
            ? { content: [{ type: "text", text: JSON.stringify(fixture) }] }
            : fixture,
        },
      ],
    } as unknown as UIMessage;
    render(
      <MessageParts
        message={message}
        mode="view"
        setMode={() => {}}
        status="ready"
        reload={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("table", { name: "Saved recording stream comparison" }),
    ).toBeTruthy();
    expect(screen.getByText("Synthetic recording")).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();
    expect(screen.getByText("125")).toBeTruthy();
  },
);

import CatalogStreamComparison from "../CatalogStreamComparison";

it.each(["incomplete", "invalid_observation", "unfinished_period"])(
  "withholds figures for %s even if supplied",
  (state) => {
    render(
      <CatalogStreamComparison
        result={{
          ...fixture,
          recordings: [
            { ...fixture.recordings[0], state, missing_days: ["2026-10-01"] },
          ],
        }}
      />,
    );
    expect(screen.getByText(/Comparison unavailable:/)).toBeTruthy();
    expect(screen.getByText(/missing values are not zero/)).toBeTruthy();
    expect(screen.queryByText("125")).toBeNull();
    expect(screen.queryByText("+25%")).toBeNull();
  },
);
it("keeps zero totals and explains an undefined zero-baseline percentage", () => {
  render(
    <CatalogStreamComparison
      result={{
        ...fixture,
        recordings: [
          {
            ...fixture.recordings[0],
            previous_streams: 0,
            absolute_growth: 125,
            percentage_growth: null,
            zero_baseline: true,
          },
        ],
      }}
    />,
  );
  expect(screen.getByText("0")).toBeTruthy();
  expect(screen.getByText("Not defined (zero baseline)")).toBeTruthy();
});
it("keeps negative supplied growth and distinguishes missing data from zero", () => {
  render(
    <CatalogStreamComparison
      result={{
        ...fixture,
        recordings: [
          {
            ...fixture.recordings[0],
            current_streams: 0,
            absolute_growth: -100,
            percentage_growth: -100,
          },
        ],
      }}
    />,
  );
  expect(screen.getByText("-100%")).toBeTruthy();
  expect(screen.getByText("-100")).toBeTruthy();
});
it("discloses provenance, periods, page coverage and freshness without network activity", () => {
  const network = vi.fn();
  vi.stubGlobal("fetch", network);
  try {
    render(<CatalogStreamComparison result={fixture} />);
    expect(screen.getByText(/Luminate · Worldwide/)).toBeTruthy();
    expect(
      screen.getByText(/2026-10-01 to 2026-10-02 \(end excluded\)/),
    ).toBeTruthy();
    expect(screen.getByText(/1 days per period · UTC/)).toBeTruthy();
    expect(
      screen.getByText(/Page 1: 1 returned recordings of 100/),
    ).toBeTruthy();
    expect(screen.getByText(/More recordings remain/)).toBeTruthy();
    expect(screen.getByText(/current recording membership/)).toBeTruthy();
    expect(screen.getByText(/Source updated: Unknown/)).toBeTruthy();
    expect(screen.getByText(/Retrieved: 2026-10-04T00:00:00Z/)).toBeTruthy();
    expect(
      screen.getByText(/Provider recording: synthetic-provider-recording/),
    ).toBeTruthy();
    expect(network).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});
it("does not infer zero streams from an empty page", () => {
  render(<CatalogStreamComparison result={{ ...fixture, recordings: [] }} />);
  expect(screen.getByText(/not evidence of zero streams/)).toBeTruthy();
  expect(screen.queryByRole("table")).toBeNull();
});
it("shows an honest fallback for incompatible units", () => {
  render(
    <CatalogStreamComparison result={{ ...fixture, metric: "royalties" }} />,
  );
  expect(screen.getByText(/does not match the supported/)).toBeTruthy();
  expect(screen.queryByRole("table")).toBeNull();
});
