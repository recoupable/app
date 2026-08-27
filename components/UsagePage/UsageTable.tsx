import type { UsageEvent } from "@/lib/recoup/getAccountUsage";
import type { UsageSort } from "@/lib/usage/usageSort";
import UsageRow from "./UsageRow";
import UsageCostHeader from "./UsageCostHeader";

interface UsageTableProps {
  events: UsageEvent[];
  sort: UsageSort;
  onSortChange: (sort: UsageSort) => void;
}

/**
 * Line items in the api's order. On a phone the row is When, Model / endpoint
 * and Cost; tokens appear from `md` up.
 */
const UsageTable = ({ events, sort, onSortChange }: UsageTableProps) => (
  <div className="overflow-x-auto rounded-2xl bg-card p-4 sm:p-6 shadow-[0_0_0_1px_var(--border)]">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
          <th className="min-w-[5.5rem] py-2 pr-3 font-medium">When</th>
          <th className="w-full py-2 px-3 font-medium">Model / endpoint</th>
          <th className="hidden md:table-cell py-2 px-3 font-medium">Tokens</th>
          <UsageCostHeader sort={sort} onSortChange={onSortChange} />
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <UsageRow key={event.id} event={event} />
        ))}
      </tbody>
    </table>
  </div>
);
export default UsageTable;
