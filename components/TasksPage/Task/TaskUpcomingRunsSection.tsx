import { formatScheduledActionDate } from "@/lib/utils/formatScheduledActionDate";

const TaskUpcomingRunsSection = ({ upcoming }: { upcoming?: string[] }) => {
  if (!upcoming || upcoming.length === 0) return null;
  return (
    <div className="pt-2 mt-1 border-t border-border">
      <p className="text-xs font-medium text-foreground mb-1.5">
        Upcoming Runs
      </p>
      <div className="flex flex-col gap-1">
        {upcoming.map((dateStr, i) => (
          <div key={i} className="text-xs text-muted-foreground">
            {formatScheduledActionDate(dateStr)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskUpcomingRunsSection;
