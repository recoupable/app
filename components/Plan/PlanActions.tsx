import ProButton from "@/components/Plan/ProButton";
import StarterButton from "@/components/Plan/StarterButton";
import { getPlanActions } from "@/lib/plan/getPlanActions";
import type { PlanActionProps } from "@/lib/plan/types";

/** Mobile only: the buy buttons stack under the table, full width, 44px. */
const PlanActions = ({ currentPlan, starterAvailable, onStartCheckout }: PlanActionProps) => {
  const actions = getPlanActions({ currentPlan, starterAvailable });
  if (!actions.pro && !actions.starter) return null;
  return (
    <div className="flex flex-col gap-2.5 sm:hidden">
      {actions.pro && <ProButton onStartCheckout={onStartCheckout} className="h-11 w-full" />}
      {actions.starter && <StarterButton onStartCheckout={onStartCheckout} className="h-11 w-full" />}
    </div>
  );
};

export default PlanActions;
