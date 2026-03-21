"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Task } from "@/lib/tasks/getTasks";
import { cn } from "@/lib/utils";
import TaskDetailsDialogHeader from "./TaskDetailsDialogHeader";
import TaskDetailsDialogContent from "./TaskDetailsDialogContent";
import TaskDetailsDialogActionButtons from "./TaskDetailsDialogActionButtons";
import { useTaskDetailsDialog } from "./useTaskDetailsDialog";

interface TaskDetailsDialogProps {
  children: React.ReactNode;
  task: Task;
  isDeleted?: boolean;
  onDelete?: () => void;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  children,
  task,
  isDeleted = false,
  onDelete,
}: TaskDetailsDialogProps) => {
  const {
    isDialogOpen,
    setIsDialogOpen,
    editTitle,
    setEditTitle,
    editPrompt,
    setEditPrompt,
    editCron,
    setEditCron,
    editModel,
    setEditModel,
    isActive,
    isPaused,
    canEdit,
  } = useTaskDetailsDialog({ task, isDeleted });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-w-xs md:max-w-md p-6 max-h-[90vh] overflow-hidden flex flex-col pt-10"
        )}
      >
        <TaskDetailsDialogHeader
          task={task}
          isActive={isActive}
          isPaused={isPaused}
          isDeleted={isDeleted}
        />

        <TaskDetailsDialogContent
          task={task}
          editTitle={editTitle}
          editPrompt={editPrompt}
          editCron={editCron}
          editModel={editModel}
          onTitleChange={setEditTitle}
          onPromptChange={setEditPrompt}
          onCronChange={setEditCron}
          onModelChange={setEditModel}
          canEdit={canEdit}
          isDeleted={isDeleted}
        />

        {/* Action Buttons - Only show if editable */}
        {canEdit && (
          <TaskDetailsDialogActionButtons
            taskId={task.id}
            editTitle={editTitle}
            editPrompt={editPrompt}
            editCron={editCron}
            editModel={editModel}
            onSaveSuccess={() => setIsDialogOpen(false)}
            onDeleteSuccess={() => {
              setIsDialogOpen(false);
              onDelete?.();
            }}
            isEnabled={!!task.enabled}
            canEdit={canEdit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;
