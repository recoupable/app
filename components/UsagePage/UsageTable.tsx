import type { UsageEvent } from "@/lib/recoup/getAccountUsage";
import UsageRow from "./UsageRow";

/** Line items, newest first. Model and tokens collapse below `md` so the cost stays in view on a phone. */
const UsageTable = ({ events }: { events: UsageEvent[] }) => (
  <div className="overflow-x-auto rounded-2xl bg-card p-4 sm:p-6 shadow-[0_0_0_1px_var(--border)]">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
          <th className="py-2 pr-3 font-medium">When</th>
          <th className="py-2 px-3 font-medium">What ran</th>
          <th className="hidden md:table-cell py-2 px-3 font-medium">
            Model / endpoint
          </th>
          <th className="hidden md:table-cell py-2 px-3 font-medium">Tokens</th>
          <th className="py-2 pl-3 font-medium text-right">Cost</th>
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
