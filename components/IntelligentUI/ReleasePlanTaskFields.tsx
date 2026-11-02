import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  taskIds,
  taskLabels,
  type ReleasePlanEdits,
} from "@/lib/intelligent-ui/playground/release-plan/types";

export default function ReleasePlanTaskFields({
  tasks,
  onChange,
}: {
  tasks: ReleasePlanEdits["tasks"];
  onChange: (tasks: ReleasePlanEdits["tasks"]) => void;
}) {
  return (
    <div className="space-y-6">
      {tasks.map((task) => {
        const update = (patch: Partial<typeof task>) =>
          onChange(
            tasks.map((item) =>
              item.id === task.id ? { ...item, ...patch } : item,
            ),
          );
        return (
          <fieldset
            key={task.id}
            className="space-y-3 rounded-xl border border-border p-4"
          >
            <legend className="px-1 text-sm font-medium">
              {taskLabels[task.id]} · pending
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`anchor-${task.id}`}>Count from</Label>
                <select
                  id={`anchor-${task.id}`}
                  value={task.anchor}
                  onChange={(event) =>
                    update({ anchor: event.target.value as typeof task.anchor })
                  }
                  className="min-h-11 w-full rounded-md border border-input bg-background px-2 text-base focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="release">Release date</option>
                  {taskIds
                    .filter((id) => id !== task.id)
                    .map((id) => (
                      <option key={id} value={id}>
                        {taskLabels[id]}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`offset-${task.id}`}>Calendar-day offset</Label>
                <Input
                  id={`offset-${task.id}`}
                  type="number"
                  min={-365}
                  max={365}
                  step={1}
                  value={Number.isNaN(task.offsetDays) ? "" : task.offsetDays}
                  onChange={(event) =>
                    update({ offsetDays: event.target.valueAsNumber })
                  }
                  className="min-h-11 focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`manual-${task.id}`}>
                Manual date (optional)
              </Label>
              <Input
                id={`manual-${task.id}`}
                type="date"
                min="1900-01-01"
                max="2100-12-31"
                value={task.manualDate ?? ""}
                onChange={(event) =>
                  update({ manualDate: event.target.value || null })
                }
                className="min-h-11 focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-sm text-muted-foreground">
                A manual date stays fixed. Clear it to follow the offset again.
              </p>
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
