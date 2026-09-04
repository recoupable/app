/** Title and the one-line scope of the page. */
const BillingPageHeader = ({ scope }: { scope: string }) => (
  <div className="mb-6">
    <h1 className="text-left font-heading text-3xl font-bold dark:text-white mb-4">
      Billing
    </h1>
    <p className="text-lg text-muted-foreground text-left font-light font-sans max-w-2xl">
      Card, plan and payments for {scope}.
    </p>
  </div>
);

export default BillingPageHeader;
