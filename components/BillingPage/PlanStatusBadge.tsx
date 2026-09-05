import { Badge } from "@/components/ui/badge";
import type { SubscriptionStatus } from "@/lib/recoup/getAccountSubscription";

const OK =
  "border-transparent bg-[rgba(34,197,94,0.10)] text-[#16a34a] shadow-none hover:bg-[rgba(34,197,94,0.10)] dark:text-[#4ade80]";
const WARN =
  "border-transparent bg-[rgba(245,158,11,0.12)] text-[#b45309] shadow-none hover:bg-[rgba(245,158,11,0.12)] dark:text-[#fbbf24]";

const LABEL: Record<Exclude<SubscriptionStatus, "none">, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Past due",
  canceled: "Canceled",
};

/** The subscription's real Stripe status, green for active/trialing, amber otherwise. */
const PlanStatusBadge = ({
  status,
}: {
  status: Exclude<SubscriptionStatus, "none">;
}) => (
  <Badge className={status === "active" || status === "trialing" ? OK : WARN}>
    {LABEL[status]}
  </Badge>
);

export default PlanStatusBadge;
