import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UsageEvent } from "@/lib/recoup/getAccountUsage";
import type { UsageSort } from "@/lib/usage/usageSort";
import UsageRow from "./UsageRow";
import UsageCostHeader from "./UsageCostHeader";

interface UsageTableProps {
  events: UsageEvent[];
  sort: UsageSort;
  onSortChange: (sort: UsageSort) => void;
}

const HEAD =
  "h-auto py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

/**
 * Line items in the api's order, on the shadcn table primitives. On a phone the
 * row is When, Model / endpoint and Cost; tokens appear from `md` up.
 */
const UsageTable = ({ events, sort, onSortChange }: UsageTableProps) => (
  <div className="overflow-x-auto rounded-2xl bg-card p-4 sm:p-6 shadow-[0_0_0_1px_var(--border)]">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className={`${HEAD} min-w-[5.5rem] pr-3`}>When</TableHead>
          <TableHead className={`${HEAD} w-full px-3`}>
            Model / endpoint
          </TableHead>
          <TableHead className={`${HEAD} hidden px-3 md:table-cell`}>
            Tokens
          </TableHead>
          <UsageCostHeader sort={sort} onSortChange={onSortChange} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <UsageRow key={event.id} event={event} />
        ))}
      </TableBody>
    </Table>
  </div>
);
export default UsageTable;
