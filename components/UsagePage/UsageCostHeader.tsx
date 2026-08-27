import type { UsageSort } from "@/lib/usage/usageSort";

interface UsageCostHeaderProps {
  sort: UsageSort;
  onSortChange: (sort: UsageSort) => void;
}

/** The Cost column header: a button that flips between most expensive first and newest first. */
const UsageCostHeader = ({ sort, onSortChange }: UsageCostHeaderProps) => {
  const active = sort === "cost";
  return (
    <th
      className="py-2 pl-3 font-medium text-right"
      aria-sort={active ? "descending" : "none"}
    >
      <button
        type="button"
        onClick={() => onSortChange(active ? "created_at" : "cost")}
        title={active ? "Show newest first" : "Show most expensive first"}
        className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-foreground ${active ? "text-foreground" : ""}`}
      >
        Cost
        <span aria-hidden="true">{active ? "▼" : "↕"}</span>
      </button>
    </th>
  );
};

export default UsageCostHeader;
