import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BillingPanel from "./BillingPanel";
import PlanStatusBadge from "./PlanStatusBadge";
import describePlanPeriod from "./describePlanPeriod";
import formatCents from "@/lib/billing/formatCents";
import formatBillingDate from "@/lib/billing/formatBillingDate";
import type { AccountSubscription } from "@/lib/recoup/getAccountSubscription";

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

/** Free with Upgrade, a card-billed plan with Manage billing, or an invoiced plan with no button. */
const PlanPanel = ({
  subscription,
  onUpgrade,
  onManage,
  canUpgrade = true,
}: {
  subscription: AccountSubscription;
  onUpgrade: () => void;
  onManage: () => void;
  /** False for organizations: their plans are set up with a Recoup contact, not self-serve checkout. */
  canUpgrade?: boolean;
}) => {
  if (subscription.status === "none") {
    return (
      <BillingPanel title="Plan">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl font-semibold tracking-tight">
              Free
            </span>
            <Badge variant="secondary">Current</Badge>
          </div>
          <span className="text-sm">$0.00 / month</span>
          <span className="text-[13px] text-muted-foreground">
            {canUpgrade
              ? "Upgrade to Starter or Pro for tasks and monthly credits."
              : "Organization plans are set up with your Recoup contact."}
          </span>
        </div>
        {canUpgrade && (
          <div>
            <Button size="sm" onClick={onUpgrade}>
              Upgrade
            </Button>
          </div>
        )}
      </BillingPanel>
    );
  }

  const invoiced = subscription.collectionMethod === "send_invoice";
  const name =
    subscription.name ??
    (invoiced
      ? "Enterprise"
      : subscription.plan
        ? capitalize(subscription.plan)
        : "Plan");
  const price =
    subscription.amountCents === null
      ? "Price unavailable"
      : `${formatCents(subscription.amountCents, subscription.currency)} / ${subscription.interval ?? "month"}`;
  const nextInvoice = subscription.currentPeriodEnd
    ? formatBillingDate(subscription.currentPeriodEnd)
    : null;

  return (
    <BillingPanel title="Plan">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="font-heading text-xl font-semibold tracking-tight">
            {name}
          </span>
          <PlanStatusBadge status={subscription.status} />
        </div>
        <span className="text-sm">
          {invoiced ? `${price}, invoiced` : price}
        </span>
        <span className="text-[13px] text-muted-foreground">
          {invoiced
            ? `${nextInvoice ? `Next invoice ${nextInvoice}, paid by invoice. ` : ""}Plan changes go through your Recoup contact.`
            : describePlanPeriod(subscription)}
        </span>
      </div>
      {!invoiced && (
        <div>
          <Button variant="outline" size="sm" onClick={onManage}>
            Manage billing
          </Button>
        </div>
      )}
    </BillingPanel>
  );
};

export default PlanPanel;
