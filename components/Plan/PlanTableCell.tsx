import { Check } from "lucide-react";
import type { PlanCell } from "@/lib/plan/planTable";

/** One comparison cell: literal text, a check mark, or a quiet dash. */
const PlanTableCell = ({ value }: { value: PlanCell }) => {
  if (value === "check") return <Check className="mx-auto size-4" aria-label="Included" />;
  if (value === "dash") return <span className="text-muted-foreground/60" aria-label="Not included">&ndash;</span>;
  return <>{value}</>;
};

export default PlanTableCell;
