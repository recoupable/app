import type { PlanActionProps } from "@/lib/plan/types";
import PlanActions from "@/components/Plan/PlanActions";
import PlanTableFooter from "@/components/Plan/PlanTableFooter";
import PlanTableHeader from "@/components/Plan/PlanTableHeader";
import PlanTableRows from "@/components/Plan/PlanTableRows";

/** The plan comparison: four columns on every width, buttons in the table on desktop and below it on mobile. */
const PlanTable = (props: PlanActionProps) => (
  <div className="flex flex-col gap-5">
    <div className="overflow-hidden rounded-xl shadow-[0_0_0_1px_var(--border)]">
      <table className="w-full table-fixed border-collapse sm:table-auto">
        <colgroup className="sm:hidden">
          <col className="w-[34%]" />
          <col className="w-[20%]" />
          <col className="w-[21%]" />
          <col className="w-[25%]" />
        </colgroup>
        <PlanTableHeader currentPlan={props.currentPlan} />
        <tbody>
          <PlanTableRows />
          <PlanTableFooter {...props} />
        </tbody>
      </table>
    </div>
    <PlanActions {...props} />
  </div>
);

export default PlanTable;
