import { PLAN_COLUMNS } from "@/lib/plan/planTable";

/** The plan columns: name over price; Pro inverted like the pricing card. */
const PlanTableHeader = () => (
  <thead>
    <tr>
      <th className="px-3 py-3 text-left text-[11px] font-medium text-muted-foreground shadow-[0_1px_0_var(--border)] sm:px-4 sm:py-4 sm:text-xs">
        <span className="sm:hidden">Compare</span>
        <span className="hidden sm:inline">Compare plans</span>
      </th>
      {PLAN_COLUMNS.map((column) => (
        <th
          key={column.id}
          className={`px-1 py-3 text-center shadow-[0_1px_0_var(--border)] sm:px-4 sm:py-4 ${
            column.id === "pro" ? "bg-foreground text-background" : ""
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold sm:text-base">{column.name}</span>
            <span className={`text-[11px] font-normal sm:text-[13px] ${column.id === "pro" ? "text-background/70" : "text-muted-foreground"}`}>
              <span className="sm:hidden">{column.id === "pro" ? "$99/mo, 3x" : column.price}</span>
              <span className="hidden sm:inline">{column.price}</span>
            </span>
          </div>
        </th>
      ))}
    </tr>
  </thead>
);

export default PlanTableHeader;
