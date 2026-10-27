"use client";
import { useId, useState } from "react";
import type { CollectionComponent } from "@/lib/intelligent-ui/schema";
import { getCollectionSummary } from "@/lib/intelligent-ui/representations/getCollectionSummary";
import { getCollectionText } from "@/lib/intelligent-ui/representations/getCollectionText";

const control =
  "min-h-11 rounded-lg border border-border px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50";
/** Local row inspection only. Rows are not authorized ObjectRefs or a saved selection. */
export default function CollectionView({
  component,
}: {
  component: CollectionComponent;
}) {
  const id = useId();
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const pages = Math.max(1, Math.ceil(component.rows.length / 25));
  const rows = component.rows.slice(page * 25, (page + 1) * 25);
  const text = getCollectionText(component);
  const copy = `${text}\n\nLOCAL SELECTION (not saved; supplied row IDs only)\n${JSON.stringify(selected)}`;
  return (
    <section aria-labelledby={`${id}-title`} className="min-w-0 space-y-3">
      <h2 id={`${id}-title`} className="text-lg font-medium">
        {component.title}
      </h2>
      <p className="text-xs leading-5 text-muted-foreground">
        {getCollectionSummary(component)}
      </p>
      <p className="text-sm leading-6">
        Select up to eight records to keep track of them while you inspect this
        table. Selection is not saved and resets when the supplied table or
        sources change, or you leave this view.
      </p>
      {rows.length ? (
        <div
          className="max-w-full overflow-x-auto rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-ring"
          role="region"
          aria-label={`${component.title} table, scroll horizontally if needed`}
          tabIndex={0}
        >
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">
              {component.title}. Page {page + 1} of {pages}.
            </caption>
            <thead>
              <tr>
                <th scope="col" className="p-2 whitespace-nowrap">
                  Select
                </th>
                <th scope="col" className="p-2 whitespace-nowrap">
                  Record
                </th>
                {component.columns.map((column) => (
                  <th
                    scope="col"
                    key={column.key}
                    className="min-w-24 p-2 [overflow-wrap:anywhere]"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border align-top">
                  <td className="p-1">
                    <label className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md focus-within:ring-2 focus-within:ring-ring">
                      <input
                        type="checkbox"
                        className="size-5 accent-brand-link"
                        aria-label={`Select ${row.label}`}
                        checked={selected.includes(row.id)}
                        disabled={
                          !selected.includes(row.id) && selected.length >= 8
                        }
                        onChange={() =>
                          setSelected((current) =>
                            current.includes(row.id)
                              ? current.filter((value) => value !== row.id)
                              : current.length < 8
                                ? [...current, row.id]
                                : current,
                          )
                        }
                      />
                    </label>
                  </td>
                  <th
                    scope="row"
                    className="p-2 font-normal [overflow-wrap:anywhere]"
                  >
                    {row.label}
                  </th>
                  {component.columns.map((column) => (
                    <td
                      key={column.key}
                      className="p-2 whitespace-pre-wrap [overflow-wrap:anywhere]"
                    >
                      {row.values[column.key] ?? "Not supplied"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No supplied records. This does not mean zero activity.</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          className={control}
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous page
        </button>
        <span className="text-xs">
          Page {page + 1} of {pages}
        </span>
        <button
          className={control}
          disabled={page + 1 >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next page
        </button>
      </div>
      <p role="status" className="text-sm">
        {selected.length} selected locally · not saved.
        {selected.length > 0 &&
          ` ${component.rows
            .filter((row) => selected.includes(row.id))
            .map((row) => row.label)
            .join(", ")}`}
      </p>
      <button
        className={control}
        disabled={!selected.length}
        onClick={() => setSelected([])}
      >
        Clear selection
      </button>
      <details>
        <summary className="min-h-11 cursor-pointer py-3 text-sm focus-visible:outline-2 focus-visible:outline-ring">
          Text and local selection
        </summary>
        <label className="sr-only" htmlFor={`${id}-copy`}>
          Collection text and local selection
        </label>
        <textarea
          id={`${id}-copy`}
          readOnly
          value={copy}
          className="min-h-48 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs focus-visible:outline-2 focus-visible:outline-ring"
        />
      </details>
    </section>
  );
}
