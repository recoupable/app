"use client";
import { useState } from "react";
import { createSelectionFixtureHost } from "@/lib/intelligent-ui/playground/selection/createSelectionFixtureHost";
import type { ObjectRef } from "@/lib/intelligent-ui/descriptors/schemas";
import SelectionReview from "./SelectionReview";

/** Explicit development fixture; never renders in a production build. */
export default function SelectionContinuityLab() {
  const [host] = useState(createSelectionFixtureHost);
  const [current, setCurrent] = useState(host.read);
  const [selection, setSelection] = useState<ObjectRef[]>([]);
  return (
    <section
      id="conversation"
      aria-label="Synthetic selection continuity"
      className="space-y-6"
    >
      <p className="text-sm">
        Synthetic host · {current.context.workspaceId} · revision{" "}
        {current.context.revision} · {current.context.purpose}
      </p>
      <details>
        <summary className="min-h-11 cursor-pointer text-sm">
          Synthetic context controls
        </summary>
        <div className="flex flex-wrap gap-2">
          {(
            ["workspace", "revision", "source", "purpose", "subject"] as const
          ).map((kind) => (
            <button
              key={kind}
              className="min-h-11 rounded-lg border border-border px-3 text-sm"
              onClick={() => setCurrent(host.change(kind))}
            >
              Change {kind}
            </button>
          ))}
        </div>
      </details>
      <SelectionReview
        current={current}
        selection={selection}
        onSelectionChange={setSelection}
      />
    </section>
  );
}
