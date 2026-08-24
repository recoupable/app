import { usePaymentProvider } from "@/providers/PaymentProvider";
import { formatCreditsAsUsd } from "@/lib/credits/creditUnit";

/**
 * Compact inline balance that lives inside the identity block.
 *
 * Shown as currency rather than a credit count. A count is only readable while
 * a credit happens to be worth a cent; at a micro-dollar the same balance
 * reads "3,330,000 / 3,330,000 credits" (chat#2000).
 */
const CreditsUsage = () => {
  const { totalCredits, credits, isLoading } = usePaymentProvider();

  return (
    <p className="text-[11px] text-muted-foreground">
      {isLoading ? (
        <span className="inline-block h-3 w-16 bg-muted animate-pulse rounded" />
      ) : (
        `${formatCreditsAsUsd(credits)} / ${formatCreditsAsUsd(totalCredits)}`
      )}
    </p>
  );
};

export default CreditsUsage;
