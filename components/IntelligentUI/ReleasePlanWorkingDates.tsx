import {
  taskLabels,
  type ResolvedPlan,
} from "@/lib/intelligent-ui/playground/release-plan/types";
import ReleasePlanConflicts from "./ReleasePlanConflicts";
interface Props {
  plan: ResolvedPlan;
}
export default function ReleasePlanWorkingDates({ plan }: Props) {
  return (
    <div className="space-y-3" aria-label="Working dates">
      <h3 className="text-sm font-medium">Working dates</h3>
      <ul className="space-y-3 text-sm leading-6">
        {plan.tasks.map((task) => (
          <li key={task.id}>
            <span className="font-medium">{taskLabels[task.id]}</span>:{" "}
            {task.date} · pending
            {task.manual && (
              <span className="block text-muted-foreground">
                Manual date retained. Offset proposes {task.proposedDate}.
              </span>
            )}
          </li>
        ))}
      </ul>
      <ReleasePlanConflicts conflicts={plan.conflicts} />
    </div>
  );
}
