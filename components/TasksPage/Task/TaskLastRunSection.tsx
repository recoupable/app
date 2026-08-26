import { RotateCw } from "lucide-react";
import { formatScheduledActionDate } from "@/lib/utils/formatScheduledActionDate";

const TaskLastRunSection = ({ lastRun }: { lastRun: string | null }) => {
  if (!lastRun) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs pt-2 mt-1 border-t border-border">
      <RotateCw className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />
      <span className="font-medium text-foreground">Last Run:</span>
      <span className="break-words text-muted-foreground">
        {formatScheduledActionDate(lastRun)}
      </span>
    </div>
  );
};

export default TaskLastRunSection;
