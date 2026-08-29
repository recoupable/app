import ProButton from "@/components/Plan/ProButton";
import StarterButton from "@/components/Plan/StarterButton";
import { getPlanActions } from "@/lib/plan/getPlanActions";
import type { PlanActionProps } from "@/lib/plan/types";
import { PLAN_COLUMNS } from "@/lib/plan/planTable";

/** Desktop only: the buy buttons sit under their plan's column. */
const PlanTableFooter = ({ currentPlan, starterAvailable, onStartCheckout }: PlanActionProps) => {
  const actions = getPlanActions({ currentPlan, starterAvailable });
  return (
    <tr className="hidden sm:table-row">
      <td className="p-4" />
      {PLAN_COLUMNS.map((column) => (
        <td key={column.id} className="p-4 text-center">
          {column.id === currentPlan && <span className="text-[13px] text-muted-foreground">Current plan</span>}
          {column.id === "starter" && actions.starter && <StarterButton onStartCheckout={onStartCheckout} className="h-9 w-full" />}
          {column.id === "pro" && actions.pro && <ProButton onStartCheckout={onStartCheckout} className="h-9 w-full" />}
        </td>
      ))}
    </tr>
  );
};

export default PlanTableFooter;
