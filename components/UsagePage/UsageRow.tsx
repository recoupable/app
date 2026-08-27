import type { UsageEvent } from "@/lib/recoup/getAccountUsage";
import describeUsageEvent from "@/lib/usage/describeUsageEvent";
import describeUsageModel from "@/lib/usage/describeUsageModel";
import formatUsageDate from "@/lib/usage/formatUsageDate";
import formatUsageTokens from "@/lib/usage/formatUsageTokens";

/** One charge. The amount is the API's USD string; the micro-dollar integer is never shown. */
const UsageRow = ({ event }: { event: UsageEvent }) => (
  <tr className="border-b border-border last:border-0 text-sm">
    <td className="py-2.5 pr-3 whitespace-nowrap text-muted-foreground">{formatUsageDate(event.created_at)}</td>
    <td className="py-2.5 px-3 whitespace-nowrap">{describeUsageEvent(event)}</td>
    <td className="py-2.5 px-3 whitespace-nowrap">{describeUsageModel(event)}</td>
    <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">{formatUsageTokens(event)}</td>
    <td className="py-2.5 pl-3 whitespace-nowrap text-right font-medium">{event.usd}</td>
  </tr>
);

export default UsageRow;
