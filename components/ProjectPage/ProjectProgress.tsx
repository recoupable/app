import { Progress } from "@/components/ui/progress";

/** How far along the engagement is, in one line the client reads first. */
const ProjectProgress = ({
  done,
  total,
  needsYou,
}: {
  done: number;
  total: number;
  needsYou: number;
}) => (
  <div className="flex flex-col gap-2">
    <Progress
      value={total ? Math.round((done / total) * 100) : 0}
      className="h-1 bg-muted"
      aria-label={`${done} of ${total} tasks done`}
    />
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span>
        {done} of {total} done
      </span>
      {needsYou > 0 && (
        <span>
          {needsYou} task{needsYou === 1 ? "" : "s"} need
          {needsYou === 1 ? "s" : ""} you
        </span>
      )}
    </div>
  </div>
);

export default ProjectProgress;
