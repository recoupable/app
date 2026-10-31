"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { objectRefKey } from "@/lib/intelligent-ui/descriptors/objectRefKey";
import type { ObjectRef } from "@/lib/intelligent-ui/descriptors/schemas";
import {
  projectSubjectContext,
  type SubjectContextCurrent,
} from "@/lib/intelligent-ui/subject-context/projectSubjectContext";

const control =
  "min-h-11 rounded-lg border border-border px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50";
/** Local review only: capture exact refs and revalidate every rendered preview. */
export default function SelectionReview({
  current,
  selection,
  onSelectionChange,
}: {
  current: SubjectContextCurrent;
  selection: ObjectRef[];
  onSelectionChange: (refs: ObjectRef[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [captured, setCaptured] = useState<null | {
    bindingKey: string;
    context: SubjectContextCurrent["context"] & { selection: ObjectRef[] };
  }>(null);
  const signature = (refs: ObjectRef[]) =>
    JSON.stringify(refs.map(objectRefKey));
  const projection =
    captured && signature(captured.context.selection) === signature(selection)
      ? projectSubjectContext(captured, current)
      : { state: "unavailable" as const };
  const capture = () =>
    setCaptured(
      structuredClone({
        bindingKey: current.bindingKey,
        context: { ...current.context, selection },
      }),
    );
  const choices = (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">
        Select up to eight recordings
      </legend>
      <label className="block text-sm">
        Find in supplied records
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-background px-3"
        />
      </label>
      {current.descriptors
        .filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase()),
        )
        .map((item, index) => {
          const key = objectRefKey(item.ref),
            checked = selection.some((ref) => objectRefKey(ref) === key);
          return (
            <label
              key={`${key}:${index}`}
              className="flex min-h-11 items-center gap-3 text-sm"
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={!checked && selection.length >= 8}
                onChange={() =>
                  onSelectionChange(
                    checked
                      ? selection.filter((ref) => objectRefKey(ref) !== key)
                      : [...selection, item.ref],
                  )
                }
                className="size-5 accent-brand-link"
              />
              {item.label}
            </label>
          );
        })}
    </fieldset>
  );
  const preview = (
    <div className="space-y-3">
      <p role="status">
        {!captured
          ? "No preview captured."
          : projection.state === "available"
            ? `${projection.context.selection.length} exact references in this local preview.`
            : "Preview unavailable. The selection or its context changed. Review the current selection and refresh."}
      </p>
      {projection.state === "available" && (
        <label className="block text-sm">
          Exact local projection
          <textarea
            readOnly
            value={JSON.stringify(projection.context, null, 2)}
            className="mt-2 min-h-48 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs"
          />
        </label>
      )}
      <div className="flex flex-wrap gap-3">
        <button className={control} onClick={capture}>
          Refresh preview
        </button>
        <button
          className={control}
          disabled={!selection.length}
          onClick={() => onSelectionChange([])}
        >
          Clear selection
        </button>
      </div>
    </div>
  );
  return (
    <section aria-label="Local selection review" className="space-y-4">
      <h2 className="text-lg font-medium">Review selected recordings</h2>
      <p className="text-sm text-muted-foreground">
        Local preview · not saved or sent. Closing the review keeps your
        selection on this page.
      </p>
      <p className="text-sm">{selection.length} selected locally.</p>
      {!open && (
        <>
          {choices}
          {preview}
        </>
      )}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button
            className={control}
            onClick={() => {
              if (!captured) capture();
            }}
          >
            Expand selection review
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-card p-6 shadow-xl outline-none">
            <Dialog.Title className="text-lg font-medium">
              Selected recordings
            </Dialog.Title>
            <Dialog.Description className="my-3 text-sm">
              Local preview only. Changes here update the same selection;
              nothing is saved or sent.
            </Dialog.Description>
            {choices}
            {preview}
            <Dialog.Close asChild>
              <button className={`${control} mt-4`}>
                Close selection review
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
