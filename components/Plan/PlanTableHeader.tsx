import { PLAN_COLUMNS, type PlanId } from "@/lib/plan/planTable";

interface PlanTableHeaderProps {
  currentPlan: PlanId;
}

/** The plan columns: name over price; the current plan is inverted. */
const PlanTableHeader = ({ currentPlan }: PlanTableHeaderProps) => (
  <thead>
    <tr>
      <th className="px-3 py-3 text-left text-[11px] font-medium text-muted-foreground shadow-[0_1px_0_var(--border)] sm:px-4 sm:py-4 sm:text-xs">
        <span className="sm:hidden">Compare</span>
        <span className="hidden sm:inline">Compare plans</span>
      </th>
      {PLAN_COLUMNS.map((column) => {
        const isCurrent = column.id === currentPlan;
        return (
          <th
            key={column.id}
            className={`px-1 py-3 text-center shadow-[0_1px_0_var(--border)] sm:px-4 sm:py-4 ${
              isCurrent ? "bg-foreground text-background" : ""
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold sm:text-base">{column.name}</span>
              <span
                className={`text-[11px] font-normal sm:text-[13px] ${
                  isCurrent ? "text-background/70" : "text-muted-foreground"
                }`}
              >
                <span className="sm:hidden">{column.id === "pro" ? "$99/mo, 3x" : column.price}</span>
                <span className="hidden sm:inline">{column.price}</span>
              </span>
            </div>
          </th>
        );
      })}
    </tr>
  </thead>
);

export default PlanTableHeader;
