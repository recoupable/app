import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import type { UsageEvent } from "@/lib/recoup/getAccountUsage";
import describeUsageModel from "@/lib/usage/describeUsageModel";
import isEndpointModel from "@/lib/usage/isEndpointModel";
import formatUsageDate from "@/lib/usage/formatUsageDate";
import formatUsageTokens from "@/lib/usage/formatUsageTokens";

/** One charge. The amount is the API's USD string; the micro-dollar integer is never shown. */
const UsageRow = ({ event }: { event: UsageEvent }) => (
  <TableRow className="text-sm hover:bg-transparent">
    <TableCell className="min-w-[5.5rem] max-w-[5.5rem] py-2.5 pr-3 text-muted-foreground md:max-w-none md:whitespace-nowrap">
      {formatUsageDate(event.created_at)}
    </TableCell>
    <TableCell className="max-w-0 py-2.5 px-3">
      <span
        className={`block break-all md:truncate ${isEndpointModel(event.model_id) ? "font-mono text-xs" : ""}`}
        title={describeUsageModel(event)}
      >
        {describeUsageModel(event)}
      </span>
    </TableCell>
    <TableCell className="hidden py-2.5 px-3 whitespace-nowrap text-muted-foreground md:table-cell">
      {formatUsageTokens(event)}
    </TableCell>
    <TableCell className="py-2.5 pl-3 whitespace-nowrap text-right font-medium">
      {event.usd}
    </TableCell>
    <TableCell className="py-2.5 pl-3 text-right">
      {event.resource_url && (
        <Link
          href={event.resource_url}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          View
        </Link>
      )}
    </TableCell>
  </TableRow>
);
export default UsageRow;
