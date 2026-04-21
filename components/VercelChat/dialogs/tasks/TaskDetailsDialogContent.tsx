import { cn } from "@/lib/utils";
import { Task } from "@/lib/tasks/getTasks";
import { Textarea } from "@/components/ui/textarea";
import TaskDetailsDialogTitle from "./TaskDetailsDialogTitle";
import TaskPromptSection from "./TaskPromptSection";
import dynamic from "next/dynamic";
import { GatewayModelSelect } from "@/components/ModelSelect/GatewayModelSelect";
import { getFeaturedModelConfig } from "@/lib/ai/featuredModels";
import useAvailableModels from "@/hooks/useAvailableModels";
import TaskLastRunSection from "./TaskLastRunSection";
import TaskScheduleSection from "./TaskScheduleSection";
import TaskRecentRunsSection from "./TaskRecentRunsSection";
import TaskUpcomingRunsSection from "./TaskUpcomingRunsSection";

const CronEditor = dynamic(
  () => import("@/components/CronEditor").then((mod) => mod.CronEditor),
  { ssr: false },
);

interface TaskDetailsDialogContentProps {
  task: Task;
  editTitle: string;
  editPrompt: string;
  editCron: string;
  editModel: string;
  onTitleChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onCronChange: (value: string) => void;
  onModelChange: (value: string) => void;
  canEdit: boolean;
  isDeleted?: boolean;
}

const TaskDetailsDialogContent: React.FC<TaskDetailsDialogContentProps> = ({
  task,
  editTitle,
  editPrompt,
  editCron,
  editModel,
  onTitleChange,
  onPromptChange,
  onCronChange,
  onModelChange,
  canEdit,
  isDeleted = false,
}) => {
  const { data: availableModels = [] } = useAvailableModels();
  const modelConfig = getFeaturedModelConfig(editModel);
  const selectedModel = availableModels.find((m) => m.id === editModel);
  const displayName =
    modelConfig?.displayName || selectedModel?.name || editModel;

  return (
    <div className={cn("flex flex-col gap-3 mt-1 overflow-y-auto")}>
      <TaskDetailsDialogTitle
        value={canEdit ? editTitle : task.title}
        onChange={onTitleChange}
        canEdit={canEdit}
      />

      {canEdit ? (
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">
            Instructions
          </label>
          <Textarea
            value={editPrompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="w-full text-xs min-h-[80px] resize-y"
            placeholder="Enter instructions..."
            disabled={false}
          />
        </div>
      ) : (
        <TaskPromptSection prompt={task.prompt} isDeleted={isDeleted} />
      )}

      {canEdit ? (
        <CronEditor
          cronExpression={editCron}
          onCronExpressionChange={onCronChange}
        />
      ) : (
        <TaskScheduleSection
          schedule={task.schedule}
          nextRun={task.next_run || ""}
          isDeleted={isDeleted}
        />
      )}

      {canEdit ? (
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">Model</label>
          <GatewayModelSelect value={editModel} onValueChange={onModelChange} />
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">Model</label>
          <p className="text-xs text-muted-foreground">
            {displayName || "Default"}
          </p>
        </div>
      )}

      <TaskLastRunSection lastRun={task.last_run} isDeleted={isDeleted} />

      <TaskRecentRunsSection
        recentRuns={task.recent_runs}
        isDeleted={isDeleted}
      />

      <TaskUpcomingRunsSection upcoming={task.upcoming} isDeleted={isDeleted} />
    </div>
  );
};

export default TaskDetailsDialogContent;
