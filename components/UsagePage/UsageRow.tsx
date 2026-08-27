import type { UsageEvent } from "@/lib/recoup/getAccountUsage";
import describeUsageModel from "@/lib/usage/describeUsageModel";
import isEndpointModel from "@/lib/usage/isEndpointModel";
import formatUsageDate from "@/lib/usage/formatUsageDate";
import formatUsageTokens from "@/lib/usage/formatUsageTokens";

/** One charge. The amount is the API's USD string; the micro-dollar integer is never shown. */
const UsageRow = ({ event }: { event: UsageEvent }) => (
  <tr className="border-b border-border last:border-0 text-sm">
    <td className="min-w-[5.5rem] max-w-[5.5rem] py-2.5 pr-3 text-muted-foreground md:max-w-none md:whitespace-nowrap">
      {formatUsageDate(event.created_at)}
    </td>
    <td className="max-w-0 py-2.5 px-3">
      <span
        className={`block truncate ${isEndpointModel(event.model_id) ? "font-mono text-xs" : ""}`}
        title={describeUsageModel(event)}
      >
        {describeUsageModel(event)}
      </span>
    </td>
    <td className="hidden md:table-cell py-2.5 px-3 whitespace-nowrap text-muted-foreground">
      {formatUsageTokens(event)}
    </td>
    <td className="py-2.5 pl-3 whitespace-nowrap text-right font-medium">
      {event.usd}
    </td>
  </tr>
);
export default UsageRow;
