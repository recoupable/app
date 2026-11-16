"use client";
import { useState } from "react";
import type { ObjectRef } from "@/lib/intelligent-ui/descriptors/schemas";
import { createAnnualScenarioFixture } from "@/lib/intelligent-ui/playground/catalog/scenario/createAnnualScenarioFixture";
import { buildAnnualScenarioRequest } from "@/lib/intelligent-ui/playground/catalog/scenario/buildAnnualScenarioRequest";
import type { ScenarioRequest } from "@/lib/intelligent-ui/playground/catalog/scenario/scenarioTypes";
import AnnualScenarioResult from "./AnnualScenarioResult";

const control =
  "min-h-11 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring";
export default function AnnualCatalogScenario() {
  const [fixture] = useState(createAnnualScenarioFixture);
  const [selection, setSelection] = useState<ObjectRef[]>(
    fixture.descriptors.map((item) => item.ref),
  );
  const [rate, setRate] = useState<string | null>(null);
  let request: ScenarioRequest | undefined;
  let refusal: string | undefined;
  try {
    request = buildAnnualScenarioRequest(fixture, selection, rate);
  } catch (error) {
    refusal =
      error instanceof Error ? error.message : "Annual fixture unavailable.";
  }
  return (
    <section
      aria-label="Annual Spotify scenario"
      className="space-y-4 rounded-xl border border-border p-4 text-sm leading-6"
    >
      <h3 className="text-lg font-medium">
        What if the assumed Spotify rate changed?
      </h3>
      <p>
        Separate invented annual fixture: January 1, 2025 to January 1, 2026
        (365 days). These records are not the daily, cumulative, Luminate or
        cash rows above. No rights or revenue verification.
      </p>
      <fieldset>
        <legend className="font-medium">Annual fixture selection</legend>
        {fixture.descriptors.map((item) => (
          <label
            key={item.ref.id}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 focus-within:ring-2 focus-within:ring-ring"
          >
            <input
              type="checkbox"
              className="size-5 accent-brand-link"
              checked={selection.some((ref) => ref.id === item.ref.id)}
              onChange={() =>
                setSelection((current) =>
                  current.some((ref) => ref.id === item.ref.id)
                    ? current.filter((ref) => ref.id !== item.ref.id)
                    : [...current, item.ref],
                )
              }
            />
            {item.label} ·{" "}
            {item.field.value.state === "known"
              ? `${item.field.value.amount} annual Spotify streams`
              : "Unknown annual streams"}
          </label>
        ))}
      </fieldset>
      <p className="text-xs">
        Captured January 2, 2026. Current freshness, collection lag and
        other-platform coverage are unverified. Small counts are not a
        population estimate; unknown is not zero.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-col gap-1">
          Hypothetical USD per Spotify stream
          <input
            className={control}
            inputMode="decimal"
            value={rate ?? String(fixture.request.assumptions.rates.spotify)}
            onChange={(event) => setRate(event.target.value)}
            aria-describedby="annual-rate-help"
          />
        </label>
        <button className={control} onClick={() => setRate(null)}>
          Reset rate to baseline
        </button>
      </div>
      <p id="annual-rate-help" className="text-xs">
        Baseline 0.004 USD per stream. Illustrative arithmetic input, not a
        provider payout rate or recommendation. Reset preserves the current
        annual selection.
      </p>
      <details>
        <summary className="min-h-11 cursor-pointer py-3 focus-visible:outline-2 focus-visible:outline-ring">
          Fixed baseline assumptions and method
        </summary>
        <p>
          Method public-estimate-spotify-rate/1 · Catalog browser adapter
          catalog-browser-scenario/1. Master controlled-share assumption 0.5;
          other-platform gross-up 0.25; net factor 0.8 (deductions already
          included); multiple 10. Low, central and high are identical in this
          arithmetic fixture. No extra fees are deducted. Full source pins and
          both assumption sets are in the receipt.
        </p>
        <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs">
          {JSON.stringify(fixture.request.assumptions, null, 2)}
        </pre>
      </details>
      {request ? (
        <AnnualScenarioResult
          key={JSON.stringify({ request, selection })}
          request={request}
          selection={selection}
        />
      ) : (
        <p role="alert">Scenario unavailable: {refusal}</p>
      )}
    </section>
  );
}
