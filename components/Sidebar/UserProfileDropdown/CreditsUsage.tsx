import Link from "next/link";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import { formatCreditsAsUsd } from "@/lib/credits/formatCreditsAsUsd";

/** Remaining / monthly balance as currency, linking to the charges behind it. */
const CreditsUsage = () => {
  const { totalCredits, credits, isLoading } = usePaymentProvider();

  return (
    <p className="text-[11px] text-muted-foreground">
      {isLoading ? (
        <span className="inline-block h-3 w-16 bg-muted animate-pulse rounded" />
      ) : (
        <Link href="/usage" className="hover:underline" title="See what used your balance">
          {`${formatCreditsAsUsd(credits)} / ${formatCreditsAsUsd(totalCredits)}`}
        </Link>
      )}
    </p>
  );
};

export default CreditsUsage;
