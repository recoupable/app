"use client";

import { useMemo, useState } from "react";
import type { ObjectRef } from "@/lib/intelligent-ui/descriptors/schemas";
import { indexDescriptors } from "@/lib/intelligent-ui/descriptors/indexDescriptors";
import { resolveSelection } from "@/lib/intelligent-ui/descriptors/resolveSelection";
import {
  describeCatalogRecord,
  catalogFixtureWorkspace,
} from "@/lib/intelligent-ui/playground/catalog/describeCatalogRecord";
import { createCatalogExplorerFixture } from "@/lib/intelligent-ui/playground/catalog/createCatalogExplorerFixture";
import { getCatalogExplorerView } from "@/lib/intelligent-ui/playground/catalog/getCatalogExplorerView";
import { compareCatalogSelection } from "@/lib/intelligent-ui/playground/catalog/compareCatalogSelection";
import { catalogCohorts } from "@/lib/intelligent-ui/playground/catalog/catalogExplorerTypes";
import { formatCatalogSourceValue } from "@/lib/intelligent-ui/playground/catalog/formatCatalogSourceValue";
import { getCatalogExplorerText } from "@/lib/intelligent-ui/playground/catalog/getCatalogExplorerText";
import DistributionView from "./DistributionView";

const control =
  "min-h-11 min-w-0 max-w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

/** Development lab only. Local selection is not saved context or authority. */
export default function CatalogExplorer() {
  const [records] = useState(createCatalogExplorerFixture);
  const [query, setQuery] = useState("");
  const [cohort, setCohort] = useState("all");
  const [descending, setDescending] = useState(false);
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<ObjectRef[]>([]);
  const view = useMemo(
    () => getCatalogExplorerView(records, { query, cohort, descending, page }),
    [records, query, cohort, descending, page],
  );
  const byId = useMemo(() => new Map(records.map((r) => [r.id, r])), [records]);
  const descriptors = useMemo(
    () => indexDescriptors(records.map(describeCatalogRecord)),
    [records],
  );
  const resolved = resolveSelection(
    catalogFixtureWorkspace,
    descriptors,
    selection,
  );
  const selected =
    resolved.state === "available"
      ? resolved.items.map((item) => byId.get(item.ref.id)!)
      : [];
  const selectedIds = selection.map((ref) => ref.id);
  const comparison = compareCatalogSelection(selected);
  const visible = new Set(view.rows.map((r) => r.id));
  const hidden = selectedIds.filter((id) => !visible.has(id)).length;
  const text =
    resolved.state === "unavailable"
      ? `${selection.length} selected references are unavailable. Reset the local view to continue.`
      : getCatalogExplorerText(view, selected);
  return (
    <section
      id="conversation"
      aria-label="Synthetic catalog explorer"
      tabIndex={-1}
      className="space-y-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        aria-label="Your question"
        className="ml-auto w-fit rounded-2xl bg-muted px-5 py-3"
      >
        Which recordings can I compare on the same basis?
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-medium">
          Explore 10,000 synthetic recordings
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Filter locally, then select up to eight recordings. Every number is
          invented. Observations, browser activity, hypothetical value and cash
          stay separate; none verifies rights or revenue.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs">
          Find recording or ID
          <input
            className={control}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-xs">
          Source cohort
          <select
            className={control}
            value={cohort}
            onChange={(e) => {
              setCohort(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All sources (not comparable)</option>
            {Object.entries(catalogCohorts).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Recording order
          <select
            className={control}
            value={descending ? "desc" : "asc"}
            onChange={(e) => {
              setDescending(e.target.value === "desc");
              setPage(1);
            }}
          >
            <option value="asc">Name A–Z</option>
            <option value="desc">Name Z–A</option>
          </select>
        </label>
      </div>
      <div className="space-y-1 text-xs leading-5 text-muted-foreground">
        <p role="status">
          {view.collection.totalCount} matches of 10,000 supplied. Page{" "}
          {view.page} of {view.pages} · {view.rows.length} shown.{" "}
          {selection.length} selected ({hidden} outside this page).
        </p>
        <p>
          Filtered coverage: {view.coverage.known} known ·{" "}
          {view.coverage.unknown} unknown · {view.coverage.withheld} withheld ·{" "}
          {view.coverage.notApplicable} not applicable. Missing is not zero.
        </p>
        <p>
          Observed October 15, 2026; 11 days old at the fixed October 26 fixture
          reference. No current freshness claim. Membership is supplied, not
          historical.
        </p>
      </div>
      <div
        className="max-w-full overflow-x-auto rounded-xl border border-border"
        tabIndex={0}
        role="region"
        aria-label="Recording table, scroll horizontally if needed"
      >
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Current page of synthetic recordings. Select exact recording
            identities to compare.
          </caption>
          <thead className="bg-muted/50 text-xs">
            <tr>
              <th className="p-3">Select</th>
              <th className="p-3">Recording / source</th>
              <th className="p-3">Unchanged source value</th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="p-3">
                  <label className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md focus-within:ring-2 focus-within:ring-ring">
                    <input
                      type="checkbox"
                      className="size-5 accent-brand-link focus-visible:outline-2 focus-visible:outline-ring"
                      aria-label={`Select ${r.label}`}
                      checked={selectedIds.includes(r.id)}
                      disabled={
                        !selectedIds.includes(r.id) && selection.length >= 8
                      }
                      onChange={() =>
                        setSelection((current) =>
                          current.some((ref) => ref.id === r.id)
                            ? current.filter((ref) => ref.id !== r.id)
                            : current.length < 8
                              ? [...current, describeCatalogRecord(r).ref]
                              : current,
                        )
                      }
                    />
                  </label>
                </td>
                <th scope="row" className="p-3 font-normal">
                  <span className="font-medium">{r.label}</span>
                  <span className="mt-1 block font-mono text-[11px] break-all">
                    {r.id}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {catalogCohorts[r.cohort as keyof typeof catalogCohorts]}
                  </span>
                  <details className="mt-1 text-xs">
                    <summary className="min-h-11 cursor-pointer py-3 focus-visible:outline-2 focus-visible:outline-ring">
                      Source basis
                    </summary>
                    <p>
                      {r.role} · {r.metric} ·{" "}
                      {r.periodStart ?? "Period unknown"} to{" "}
                      {r.periodEnd ?? "unknown"} · {r.territory} ·{" "}
                      {r.sourceVersion}
                    </p>
                  </details>
                </th>
                <td className="p-3 font-mono text-xs">
                  {formatCatalogSourceValue(r)}
                  {r.role === "hypothetical" && (
                    <strong className="mt-1 block font-sans">
                      Hypothetical only
                    </strong>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {view.rows.length === 0 && (
          <p className="p-4 text-sm">
            No matching recordings. Change the filters; this does not mean zero
            activity.
          </p>
        )}
      </div>
      <nav
        aria-label="Recording pages"
        className="flex flex-wrap items-center gap-3"
      >
        <button
          className={control}
          disabled={view.page === 1}
          onClick={() => setPage(view.page - 1)}
        >
          Previous page
        </button>
        <span className="text-xs">
          {view.page} / {view.pages}
        </span>
        <button
          className={control}
          disabled={!view.hasMore}
          onClick={() => setPage(view.page + 1)}
        >
          Next page
        </button>
      </nav>
      <section
        aria-label="Selected recording comparison"
        className="space-y-3 border-t border-border pt-5"
      >
        <h3 className="font-medium">Your selection</h3>
        <p className="text-xs text-muted-foreground">
          Selection stays across local filters and pages. It resets when you
          leave this example. Small selections are not a population estimate.
        </p>
        <ul className="space-y-2">
          {selected.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 text-sm"
            >
              <span>
                {r.label} · {formatCatalogSourceValue(r)}
              </span>
              <button
                className={control}
                onClick={() =>
                  setSelection((current) =>
                    current.filter((ref) => ref.id !== r.id),
                  )
                }
              >
                Remove {r.label}
              </button>
            </li>
          ))}
        </ul>
        <p role="status" className="text-sm leading-6">
          {resolved.state === "unavailable"
            ? `${selection.length} selected references are unavailable. Reset the local view to continue.`
            : (comparison.reason ??
              (comparison.distribution
                ? "Same source, period, unit and cohort. Chart covers only this exact selection."
                : "Compatible supplied currency values. No finance aggregation or projection."))}
        </p>
        {comparison.distribution && (
          <DistributionView component={comparison.distribution} />
        )}
        <button
          className={control}
          onClick={() => {
            setQuery("");
            setCohort("all");
            setDescending(false);
            setPage(1);
            setSelection([]);
          }}
        >
          Reset local view
        </button>
      </section>
      <p className="text-sm leading-6 text-muted-foreground">
        Scenario calculations are unavailable: no approved method or assumptions
        are supplied. Hypothetical fixture values never alter observations. No
        additional data is fetched.
      </p>
      <details className="text-sm">
        <summary className="min-h-11 cursor-pointer py-3">
          Text view / copy current page and selection
        </summary>
        <label className="sr-only" htmlFor="catalog-explorer-text">
          Source-preserving text
        </label>
        <textarea
          id="catalog-explorer-text"
          readOnly
          value={text}
          className="min-h-64 w-full rounded-xl border border-border bg-background p-3 font-mono text-xs focus-visible:ring-2 focus-visible:ring-ring"
        />
      </details>
    </section>
  );
}
