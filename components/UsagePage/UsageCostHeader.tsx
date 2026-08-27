import { ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import type { UsageSort } from "@/lib/usage/usageSort";

interface UsageCostHeaderProps {
  sort: UsageSort;
  onSortChange: (sort: UsageSort) => void;
}

/** The Cost column header, in the shadcn data-table idiom: a ghost button that flips between most expensive first and newest first. */
const UsageCostHeader = ({ sort, onSortChange }: UsageCostHeaderProps) => {
  const active = sort === "cost";
  return (
    <TableHead
      className="h-auto py-2 pl-3 text-right"
      aria-sort={active ? "descending" : "none"}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSortChange(active ? "created_at" : "cost")}
        title={active ? "Show newest first" : "Show most expensive first"}
        className={`-mr-2 h-7 px-2 text-[11px] font-medium uppercase tracking-wide ${active ? "text-foreground" : "text-muted-foreground"}`}
      >
        Cost
        {active ? (
          <ArrowDown aria-hidden="true" />
        ) : (
          <ArrowUpDown aria-hidden="true" />
        )}
      </Button>
    </TableHead>
  );
};
export default UsageCostHeader;
