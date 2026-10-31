"use client";
import { useState } from "react";
import type { CreativeAsset } from "@/lib/intelligent-ui/playground/creative/types";
import { creativeRefKey } from "@/lib/intelligent-ui/playground/creative/creativeRefKey";
import { useCreativeDraft } from "@/lib/intelligent-ui/playground/creative/useCreativeDraft";
import { getCreativeFollowUp } from "@/lib/intelligent-ui/playground/creative/getCreativeFollowUp";
import { resolveCreativeAsset } from "@/lib/intelligent-ui/playground/creative/resolveCreativeAsset";
import CreativeAssetPreview from "./CreativeAssetPreview";

/** A scope-keyed editor keeps local notes and inspection state isolated. */
export default function CreativeComparisonView({
  scope,
  assets,
}: {
  scope: string;
  assets: CreativeAsset[];
}) {
  const { draft, ready, message, update } = useCreativeDraft(scope);
  const [inspected, setInspected] = useState<string[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  const signature = JSON.stringify(
    assets.map((asset) => [
      creativeRefKey(asset.ref),
      asset.status,
      asset.preview,
    ]),
  );
  const [previousSignature, setPreviousSignature] = useState(signature);
  if (previousSignature !== signature) {
    setPreviousSignature(signature);
    setInspected([]);
    setFailed([]);
  }

  const current = assets.map((asset) =>
    failed.includes(creativeRefKey(asset.ref))
      ? { ...asset, status: "unavailable" as const }
      : asset,
  );
  const reference = getCreativeFollowUp(scope, draft.selection, current);
  const selectedKey = draft.selection && creativeRefKey(draft.selection);
  const inspectedSelection = selectedKey && inspected.includes(selectedKey);
  return (
    <section aria-label="Creative comparison" className="space-y-6">
      <p role="status" className="text-sm">
        {message}
      </p>
      <div className="grid gap-6">
        {assets.map((asset) => {
          const key = creativeRefKey(asset.ref);
          const selected = selectedKey === key;
          const available =
            Boolean(resolveCreativeAsset(asset)) && !failed.includes(key);
          const note =
            draft.notes.find((entry) => creativeRefKey(entry.ref) === key)
              ?.text ?? "";
          return (
            <article
              key={key}
              className="min-w-0 space-y-4 rounded-2xl border border-border bg-card p-5"
            >
              <h2 className="text-lg font-medium">{asset.label}</h2>
              <p className="text-sm">
                {asset.status === "available"
                  ? "Existing asset · not a generation or approval result"
                  : `${asset.status} · simulated fixture state`}
              </p>
              <CreativeAssetPreview
                key={`${signature}:${key}`}
                asset={asset}
                onReady={() =>
                  setInspected((previous) =>
                    previous.includes(key) ? previous : [...previous, key],
                  )
                }
                onFailure={() =>
                  setFailed((previous) =>
                    previous.includes(key) ? previous : [...previous, key],
                  )
                }
              />
              <p className="text-sm leading-6 text-muted-foreground">
                {asset.provenance}
              </p>
              <details>
                <summary className="min-h-11 cursor-pointer py-3 text-sm">
                  Exact asset revision
                </summary>
                <p className="break-all font-mono text-xs leading-6">
                  {asset.ref.assetId} · SHA-256 {asset.ref.version}
                </p>
              </details>
              <button
                type="button"
                aria-pressed={selected && available}
                disabled={!ready || !available || !inspected.includes(key)}
                className="min-h-11 rounded-lg border border-border px-4 text-sm disabled:opacity-50 aria-pressed:bg-brand-lime aria-pressed:text-[#182E28] focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() =>
                  update({ ...draft, selection: selected ? null : asset.ref })
                }
              >
                {selected && available
                  ? `Clear choice: ${asset.label}`
                  : `Choose ${asset.label}`}
              </button>
              {available && !inspected.includes(key) && (
                <p className="text-xs text-muted-foreground">
                  Inspect the preview before choosing this revision.
                </p>
              )}
              <label className="block space-y-2 text-sm">
                <span>Notes for {asset.label}</span>
                <textarea
                  disabled={!ready}
                  maxLength={2000}
                  value={note}
                  className="min-h-24 w-full rounded-lg border border-border bg-background p-3 focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) =>
                    update({
                      ...draft,
                      notes: [
                        ...draft.notes
                          .filter((entry) => creativeRefKey(entry.ref) !== key)
                          .slice(-7),
                        { ref: asset.ref, text: event.target.value },
                      ],
                    })
                  }
                />
              </label>
            </article>
          );
        })}
      </div>
      {draft.selection && !reference && (
        <p role="status">
          The stored choice is unavailable or its revision changed. Notes remain
          tied to their original revision. Inspect and choose an available
          revision.
        </p>
      )}
      {reference && !inspectedSelection && (
        <p role="status">
          Your exact choice was restored. Inspect its preview to make the local
          reference available again.
        </p>
      )}
      {reference && inspectedSelection && (
        <label className="block space-y-2 text-sm">
          <span>Read-only local follow-up reference</span>
          <textarea
            readOnly
            aria-label="Read-only local follow-up reference"
            value={JSON.stringify(reference, null, 2)}
            className="min-h-52 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="block text-muted-foreground">
            Select this text to copy it. No notes or media URLs are included.
            Nothing is sent, approved, published or saved to an account.
          </span>
        </label>
      )}
    </section>
  );
}
