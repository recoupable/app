import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Consistent, friendly empty state for tools that return zero results.
 * Use *inside* a ToolCard body so the header still communicates what ran.
 */
export function ToolEmpty({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-8 text-center",
        className,
      )}
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default ToolEmpty;
