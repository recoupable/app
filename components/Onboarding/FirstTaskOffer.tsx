"use client";

import { useState } from "react";

interface FirstTaskOfferProps {
  onAccept: () => void;
}

/**
 * The explicit "every month too?" question, shown instead of the automatic
 * create when the account already has an active report (recoupable/app#1941).
 * "Not now" only hides the question; nothing is created or changed.
 */
const FirstTaskOffer = ({ onAccept }: FirstTaskOfferProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        No monthly report for this one.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <p className="text-sm font-medium text-foreground">
        Get this report every month too?
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Yes, monthly
        </button>
      </div>
    </div>
  );
};

export default FirstTaskOffer;
