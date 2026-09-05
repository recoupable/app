import type { ReactNode } from "react";

/** One card on the billing page: title row, then whatever the panel shows. */
const BillingPanel = ({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) => (
  <section className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl bg-card p-4 shadow-[0_0_0_1px_var(--border)] sm:p-6">
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-heading text-base font-semibold leading-none tracking-tight">
        {title}
      </h2>
      {aside}
    </div>
    {children}
  </section>
);

export default BillingPanel;
