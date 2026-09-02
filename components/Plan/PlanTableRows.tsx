import PlanTableCell from "@/components/Plan/PlanTableCell";
import { PLAN_TABLE_ROWS } from "@/lib/plan/planTable";

/** The comparison rows, shared rows first. */
const PlanTableRows = () => (
  <>
    {PLAN_TABLE_ROWS.map((row) => (
      <tr key={row.label}>
        <td className="px-3 py-2.5 text-xs text-muted-foreground shadow-[0_1px_0_var(--border)] sm:px-4 sm:py-3 sm:text-sm">
          <span className="sm:hidden">{row.mobileLabel}</span>
          <span className="hidden sm:inline">{row.label}</span>
        </td>
        {row.cells.map((cell, index) => (
          <td key={index} className="px-1 py-2.5 text-center text-xs shadow-[0_1px_0_var(--border)] sm:px-4 sm:py-3 sm:text-sm">
            <PlanTableCell value={cell} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default PlanTableRows;
