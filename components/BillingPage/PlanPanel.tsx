import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BillingPanel from "./BillingPanel";
import formatCents from "@/lib/billing/formatCents";
import formatBillingDate from "@/lib/billing/formatBillingDate";
import type { AccountSubscription } from "@/lib/recoup/getAccountSubscription";

const ActiveBadge = () => (
  <Badge className="border-transparent bg-[rgba(34,197,94,0.10)] text-[#16a34a] shadow-none hover:bg-[rgba(34,197,94,0.10)] dark:text-[#4ade80]">
    Active
  </Badge>
);

/** Free with Upgrade, a card-billed plan with Manage billing, or an invoiced plan with no button. */
const PlanPanel = ({
  subscription,
  onUpgrade,
  onManage,
}: {
  subscription: AccountSubscription;
  onUpgrade: () => void;
  onManage: () => void;
}) => {
  if (subscription.status === "none") {
    return (
      <BillingPanel title="Plan">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl font-semibold tracking-tight">Free</span>
            <Badge variant="secondary">Current</Badge>
          </div>
          <span className="text-sm">$0.00 / month</span>
          <span className="text-[13px] text-muted-foreground">
            Upgrade to Starter or Pro for tasks and monthly credits.
          </span>
        </div>
        <div>
          <Button size="sm" onClick={onUpgrade}>Upgrade</Button>
        </div>
      </BillingPanel>
    );
  }

  const amount = formatCents(subscription.amountCents ?? 0, subscription.currency);
  const interval = subscription.interval ?? "month";
  const periodEnd = subscription.currentPeriodEnd
    ? formatBillingDate(subscription.currentPeriodEnd)
    : null;

  if (subscription.collectionMethod === "send_invoice") {
    return (
      <BillingPanel title="Plan">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl font-semibold tracking-tight">
              {subscription.name ?? "Enterprise"}
            </span>
            <ActiveBadge />
          </div>
          <span className="text-sm">{amount} / {interval}, invoiced</span>
          <span className="text-[13px] text-muted-foreground">
            {periodEnd ? `Next invoice ${periodEnd}, paid by invoice. ` : ""}
            Plan changes go through your Recoup contact.
          </span>
        </div>
      </BillingPanel>
    );
  }

  return (
    <BillingPanel title="Plan">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="font-heading text-xl font-semibold tracking-tight">
            {subscription.name ?? subscription.plan ?? "Plan"}
          </span>
          <ActiveBadge />
        </div>
        <span className="text-sm">{amount} / {interval}</span>
        <span className="text-[13px] text-muted-foreground">
          {periodEnd ? `Renews ${periodEnd} on the card above.` : "Billed to the card above."}
        </span>
      </div>
      <div>
        <Button variant="outline" size="sm" onClick={onManage}>Manage billing</Button>
      </div>
    </BillingPanel>
  );
};

export default PlanPanel;
