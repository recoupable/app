"use client";

import PageContainer from "@/components/TasksPage/PageContainer";
import PlanPageHeader from "@/components/Plan/PlanPageHeader";
import PlanStats from "@/components/Plan/PlanStats";
import PlanTable from "@/components/Plan/PlanTable";
import { usePlanPage } from "@/hooks/usePlanPage";

/** `/plan`: what the account has, what each plan adds, and the buttons to move up. */
const PlanPage = () => {
  const plan = usePlanPage();
  return (
    <PageContainer className="max-w-4xl py-8">
      <PlanPageHeader />
      <div className="flex flex-col gap-6 sm:gap-8">
        <PlanStats currentPlan={plan.currentPlan} refillDate={plan.refillDate} credits={plan.credits} tasks={plan.tasks} />
        <PlanTable currentPlan={plan.currentPlan} starterAvailable={plan.starterAvailable} onStartCheckout={(p) => void plan.startCheckout(p)} />
      </div>
    </PageContainer>
  );
};

export default PlanPage;
