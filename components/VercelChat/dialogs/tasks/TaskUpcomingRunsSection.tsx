import { cn } from "@/lib/utils";
import { formatScheduledActionDate } from "@/lib/utils/formatScheduledActionDate";

interface TaskUpcomingRunsSectionProps {
  upcoming?: string[];
  isDeleted?: boolean;
}

const TaskUpcomingRunsSection = ({
  upcoming,
  isDeleted,
}: TaskUpcomingRunsSectionProps) => {
  if (!upcoming || upcoming.length === 0) return null;

  return (
    <div className={cn("pt-2 mt-1 border-t border-border", { "border-red-100": isDeleted })}>
      <p className={cn("text-xs font-medium text-foreground mb-1.5", { "text-red-700": isDeleted })}>
        Upcoming Runs
      </p>
      <div className="flex flex-col gap-1">
        {upcoming.map((dateStr, i) => (
          <div key={i} className={cn("text-xs text-muted-foreground", { "text-red-600": isDeleted })}>
            {formatScheduledActionDate(dateStr)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskUpcomingRunsSection;
