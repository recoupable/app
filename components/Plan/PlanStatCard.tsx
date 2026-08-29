import type { ReactNode } from "react";

interface PlanStatCardProps {
  label: string;
  value: ReactNode;
  children?: ReactNode;
}

/** One of the three cards above the table: a label, a big value, an optional meter or note. */
const PlanStatCard = ({ label, value, children }: PlanStatCardProps) => (
  <div className="flex flex-col gap-1.5 rounded-xl p-4 shadow-[0_0_0_1px_var(--border)] sm:gap-2 sm:p-5">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-[22px] font-semibold leading-7 tracking-[-0.02em] sm:text-2xl sm:leading-8">{value}</p>
    {children}
  </div>
);

export default PlanStatCard;
