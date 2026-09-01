import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Marks the one thing on a project waiting on the person reading it.
 *
 * The only colour on an otherwise achromatic page, which is what makes the ask
 * unmissable. `DESIGN.md` allows colour for status and forbids it in chrome.
 */
const NeedsYouPill = () => (
  <Badge
    variant="outline"
    className="shrink-0 gap-1 rounded-full border-transparent bg-amber-500/10 py-1 font-medium text-amber-700 dark:text-amber-400"
  >
    <AlertCircle className="size-3.5" />
    Needs you
  </Badge>
);

export default NeedsYouPill;
