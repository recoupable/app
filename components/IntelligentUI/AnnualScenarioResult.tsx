"use client";
import { useEffect, useState } from "react";
import type { ObjectRef } from "@/lib/intelligent-ui/descriptors/schemas";
import { runScenario } from "@/lib/intelligent-ui/playground/catalog/scenario/vendor/scenario.mjs";
import pin from "@/lib/intelligent-ui/playground/catalog/scenario/source-pin.json";
import type {
  ScenarioRequest,
  ScenarioResult,
} from "@/lib/intelligent-ui/playground/catalog/scenario/scenarioTypes";

/** The parent keys each request; cleanup drops superseded local Web Crypto results. */
export default function AnnualScenarioResult({
  request,
  selection,
}: {
  request: ScenarioRequest;
  selection: readonly ObjectRef[];
}) {
  const [state, setState] = useState<{
    result?: ScenarioResult;
    error?: string;
  }>({});
  useEffect(() => {
    let current = true;
    runScenario(request).then(
      (result) => {
        if (current) setState({ result });
      },
      (error: unknown) => {
        if (current)
          setState({
            error:
              error instanceof Error
                ? error.message
                : "Local scenario calculation failed.",
          });
      },
    );
    return () => {
      current = false;
    };
  }, [request]);
  if (state.error)
    return <p role="alert">Scenario unavailable: {state.error}</p>;
  const result = state.result;
  if (!result)
    return <p role="status">Calculating locally… No data is fetched.</p>;
  const coverageLabel =
    result.scenario.status === "insufficient_measurement"
      ? "Insufficient annual measurements"
      : result.scenario.status === "complete_input_subset"
        ? "Complete supplied subset"
        : "Partial supplied subset";
  const money = (value: number | null) =>
    value === null ? "Unknown" : `${String(value)} ${result.scenario.currency}`;
  return (
    <div className="space-y-3">
      <p role="status">
        Hypothetical result · {result.scenario.covered_tracks} of{" "}
        {result.scenario.input_tracks} selected recordings measured ·{" "}
        {coverageLabel}. Covered subset only.
      </p>
      <p className="text-xs">
        Unknown recordings:{" "}
        {result.scenario.unknown_track_ids.join(", ") || "None in selection"}.
        No extrapolation to missing recordings. Other-platform value uses the
        fixed hypothetical gross-up, not observed platform coverage.
      </p>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt>Baseline hypothetical value (central)</dt>
          <dd className="font-mono">{money(result.baseline.value.central)}</dd>
        </div>
        <div>
          <dt>Scenario hypothetical value (central)</dt>
          <dd className="font-mono">{money(result.scenario.value.central)}</dd>
        </div>
      </dl>
      <p className="text-xs">
        All low/central/high outputs and full assumptions are preserved below.
        Money is modeled, not reported royalties or realized cash. Rights and
        controlled share remain assumptions.
      </p>
      <details>
        <summary className="min-h-11 cursor-pointer py-3 focus-visible:outline-2 focus-visible:outline-ring">
          Full scenario receipt / copy JSON
        </summary>
        <label className="sr-only" htmlFor="annual-scenario-receipt">
          Annual scenario receipt
        </label>
        <textarea
          id="annual-scenario-receipt"
          readOnly
          value={JSON.stringify(
            { consumption: pin, selection, ...result },
            null,
            2,
          )}
          className="min-h-72 w-full rounded-xl border border-border bg-background p-3 font-mono text-xs focus-visible:ring-2 focus-visible:ring-ring"
        />
      </details>
    </div>
  );
}
