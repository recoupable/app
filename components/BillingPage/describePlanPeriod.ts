import formatBillingDate from "@/lib/billing/formatBillingDate";
import type { AccountSubscription } from "@/lib/recoup/getAccountSubscription";

/** The one-line period sentence under a card-billed plan, by status. */
const describePlanPeriod = (subscription: AccountSubscription): string => {
  const when = subscription.currentPeriodEnd
    ? formatBillingDate(subscription.currentPeriodEnd)
    : null;
  switch (subscription.status) {
    case "past_due":
      return "Payment failed, update your card to keep the plan.";
    case "canceled":
      return when
        ? `Ends ${when}.`
        : "Ends at the close of the current period.";
    default:
      return when
        ? `Renews ${when} on the card above.`
        : "Billed to the card above.";
  }
};

export default describePlanPeriod;
