import PlanStatCard from "@/components/Plan/PlanStatCard";
import UpgradeMeter from "@/components/UpgradePrompt/UpgradeMeter";
import { formatCreditsAsUsd } from "@/lib/credits/formatCreditsAsUsd";
import { PLAN_COLUMNS, type PlanId } from "@/lib/plan/planTable";

interface PlanStatsProps {
  currentPlan: PlanId;
  refillDate: string;
  credits: { remaining: number; total: number };
  tasks: { enabled: number; limit: number | null };
}

const Sub = ({ children }: { children: string }) => (
  <span className="text-xs font-normal text-muted-foreground sm:text-sm"> {children}</span>
);

/** Your plan, credits and tasks at a glance; meters only where there is a cap. */
const PlanStats = ({ currentPlan, refillDate, credits, tasks }: PlanStatsProps) => {
  const remaining = Math.max(0, credits.remaining);
  const planName = PLAN_COLUMNS.find((c) => c.id === currentPlan)?.name ?? "Free";
  return (
    <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <PlanStatCard label="Your plan" value={planName}>
        {refillDate && <p className="text-xs text-muted-foreground sm:text-[13px]">Refills {refillDate}</p>}
      </PlanStatCard>
      <div className="grid grid-cols-2 gap-3 sm:contents">
        <PlanStatCard
          label="Credits"
          value={
            <>
              {formatCreditsAsUsd(remaining)}
              <Sub>{`of ${formatCreditsAsUsd(credits.total)}`}</Sub>
            </>
          }
        >
          <UpgradeMeter ratio={credits.total > 0 ? remaining / credits.total : 0} label="Credits left this month" />
        </PlanStatCard>
        <PlanStatCard
          label="Tasks"
          value={
            <>
              {tasks.enabled}
              {tasks.limit !== null && <Sub>{`of ${tasks.limit}`}</Sub>}
            </>
          }
        >
          {tasks.limit !== null && <UpgradeMeter ratio={tasks.limit > 0 ? tasks.enabled / tasks.limit : 0} label="Tasks in use" />}
        </PlanStatCard>
      </div>
    </div>
  );
};

export default PlanStats;
