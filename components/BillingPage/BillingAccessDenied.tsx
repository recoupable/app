import Link from "next/link";

/** Shown when the api refuses the account's billing reads (403) or the route id is not an account id. */
const BillingAccessDenied = () => (
  <div className="rounded-2xl bg-card p-8 text-center shadow-[0_0_0_1px_var(--border)]">
    <p className="text-sm text-muted-foreground">
      You do not have access to this account&apos;s billing.
    </p>
    <Link
      href="/billing"
      className="mt-3 inline-block text-sm underline underline-offset-[3px] hover:text-foreground"
    >
      Back to your billing
    </Link>
  </div>
);

export default BillingAccessDenied;
