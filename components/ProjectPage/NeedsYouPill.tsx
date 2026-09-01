import { AlertCircle } from "lucide-react";

/**
 * Marks the one thing on a project waiting on the person reading it.
 *
 * The only colour on an otherwise achromatic page, which is what makes the ask
 * unmissable. `DESIGN.md` allows colour for status and forbids it in chrome.
 */
const NeedsYouPill = () => (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
    <AlertCircle className="size-3.5" />
    Needs you
  </span>
);

export default NeedsYouPill;
