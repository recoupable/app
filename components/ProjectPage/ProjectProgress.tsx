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
    <div className="h-1 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full bg-foreground transition-[width] duration-300"
        style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
      />
    </div>
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span>
        {done} of {total} done
      </span>
      {needsYou > 0 && (
        <span>
          {needsYou} task{needsYou === 1 ? "" : "s"} need{needsYou === 1 ? "s" : ""} you
        </span>
      )}
    </div>
  </div>
);

export default ProjectProgress;
