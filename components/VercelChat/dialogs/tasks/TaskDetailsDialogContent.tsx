import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Task } from "@/lib/tasks/getTasks";
import { Textarea } from "@/components/ui/textarea";
import {
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputModelSelectContent,
} from "@/components/ai-elements/prompt-input";
import ModelSelectItem from "@/components/ModelSelect/ModelSelectItem";
import TaskDetailsDialogTitle from "./TaskDetailsDialogTitle";
import TaskPromptSection from "./TaskPromptSection";
import dynamic from "next/dynamic";

const CronEditor = dynamic(
  () => import("@/components/CronEditor").then((mod) => mod.CronEditor),
  { ssr: false }
);
import TaskLastRunSection from "./TaskLastRunSection";
import TaskScheduleSection from "./TaskScheduleSection";
import TaskRecentRunsSection from "./TaskRecentRunsSection";
import TaskUpcomingRunsSection from "./TaskUpcomingRunsSection";
import { getFeaturedModelConfig } from "@/lib/ai/featuredModels";
import { organizeModels } from "@/lib/ai/organizeModels";
import useAvailableModels from "@/hooks/useAvailableModels";

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
  
  const organizedModels = useMemo(() => {
    return organizeModels(availableModels);
  }, [availableModels]);

  const selectedModel = availableModels.find(m => m.id === editModel);
  const displayName = modelConfig?.displayName || selectedModel?.name || editModel;

  return (
    <div className={cn("flex flex-col gap-3 mt-1 overflow-y-auto")}>
      {/* Title Section */}
      <TaskDetailsDialogTitle
        value={canEdit ? editTitle : task.title}
        onChange={onTitleChange}
        canEdit={canEdit}
      />

      {/* Prompt Section */}
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

      {/* Schedule Section */}
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

      {/* Model Section */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Model</label>
        {canEdit ? (
          <PromptInputModelSelect value={editModel} onValueChange={onModelChange}>
            <PromptInputModelSelectTrigger>
              <PromptInputModelSelectValue placeholder="Select a model">
                {displayName}
              </PromptInputModelSelectValue>
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              {/* Featured Models */}
              {organizedModels.featuredModels.map((model) => (
                <ModelSelectItem key={model.id} model={model} />
              ))}

              {/* More Models Section */}
              {organizedModels.otherModels.length > 0 && (
                <>
                  {organizedModels.featuredModels.length > 0 && (
                    <div className="my-1 h-px bg-border" />
                  )}
                  <div className="px-3 py-2.5 text-sm font-medium text-muted-foreground">
                    More Models
                  </div>
                  {organizedModels.otherModels.map((model) => (
                    <ModelSelectItem key={model.id} model={model} />
                  ))}
                </>
              )}
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>
        ) : (
          <p className="text-xs text-muted-foreground">
            {displayName || "Default"}
          </p>
        )}
      </div>

      {/* Last Run Information - Read-only */}
      <TaskLastRunSection lastRun={task.last_run} isDeleted={isDeleted} />

      {/* Recent Runs from Trigger.dev */}
      <TaskRecentRunsSection recentRuns={task.recent_runs} isDeleted={isDeleted} />

      {/* Upcoming Scheduled Runs from Trigger.dev */}
      <TaskUpcomingRunsSection upcoming={task.upcoming} isDeleted={isDeleted} />
    </div>
  );
};

export default TaskDetailsDialogContent;
