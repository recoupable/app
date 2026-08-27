import dynamic from "next/dynamic";
import { Task } from "@/lib/tasks/getTasks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TimezoneSelect from "@/components/TimezoneSelect/TimezoneSelect";
import TaskModelSelect from "./TaskModelSelect";
import TaskRecentRunsSection from "./TaskRecentRunsSection";

const CronEditor = dynamic(
  () => import("@/components/CronEditor").then((mod) => mod.CronEditor),
  { ssr: false },
);

interface TaskDetailsProps {
  task: Task;
  editTitle: string;
  editPrompt: string;
  editCron: string;
  editModel: string;
  editTimezone: string;
  onTitleChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onCronChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

/**
 * The task page body: an edit form for name, instructions, schedule,
 * timezone and model, followed by the task's recent runs from Trigger.dev,
 * each linking to its run page. Last and next run live in the page header.
 */
const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  editTitle,
  editPrompt,
  editCron,
  editModel,
  editTimezone,
  onTitleChange,
  onPromptChange,
  onCronChange,
  onModelChange,
  onTimezoneChange,
}) => (
  <div className="flex flex-col gap-3 mt-1">
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground">Name</label>
      <Input
        value={editTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full text-sm"
        placeholder="Enter task name"
      />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground">
        Instructions
      </label>
      <Textarea
        value={editPrompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className="w-full text-xs min-h-[80px] resize-y"
        placeholder="Enter instructions..."
      />
    </div>
    <CronEditor
      cronExpression={editCron}
      onCronExpressionChange={onCronChange}
    />
    <TimezoneSelect value={editTimezone} onValueChange={onTimezoneChange} />
    <TaskModelSelect value={editModel} onValueChange={onModelChange} />
    <TaskRecentRunsSection recentRuns={task.recent_runs} />
  </div>
);

export default TaskDetails;
