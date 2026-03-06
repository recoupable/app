import { CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatScheduledActionDate } from "@/lib/utils/formatScheduledActionDate";
import { parseCronToHuman } from "@/lib/tasks/parseCronToHuman";

interface TaskScheduleSectionProps {
  schedule: string | null;
  nextRun: string;
  isDeleted?: boolean;
}

const TaskScheduleSection = ({
  schedule,
  nextRun,
  isDeleted,
}: TaskScheduleSectionProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
      <div className={cn("flex flex-col gap-1 p-2 rounded-lg bg-muted", {
        "bg-red-50 border-red-100": isDeleted
      })}>
        <div className={cn("flex items-center gap-1.5 font-medium text-foreground", {
          "text-red-700": isDeleted
        })}>
          <CalendarDays className={cn("h-3.5 w-3.5 flex-shrink-0 text-indigo-600", {
            "text-red-600": isDeleted
          })} />
          Schedule
        </div>
        <div className={cn("break-words text-muted-foreground", {
          "text-red-600": isDeleted
        })}>
          <span className="font-mono">{schedule || "No schedule"}</span>
          {schedule && (
            <div className={cn("text-[10px] mt-0.5 text-muted-foreground", {
              "text-red-500": isDeleted
            })}>
              {parseCronToHuman(schedule)}
            </div>
          )}
        </div>
      </div>

      <div className={cn("flex flex-col gap-1 p-2 rounded-lg bg-muted", {
        "bg-red-50 border-red-100": isDeleted
      })}>
        <div className={cn("flex items-center gap-1.5 font-medium text-foreground", {
          "text-red-700": isDeleted
        })}>
          <Clock className={cn("h-3.5 w-3.5 flex-shrink-0 text-orange-600", {
            "text-red-600": isDeleted
          })} />
          Next Run
        </div>
        <div className={cn("break-words text-muted-foreground", {
          "text-red-600": isDeleted
        })}>
          {formatScheduledActionDate(nextRun)}
        </div>
      </div>
    </div>
  );
};

export default TaskScheduleSection;

