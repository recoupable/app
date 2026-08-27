import { cn } from "@/lib/utils";

/**
 * The centered content column for the task pages (`/tasks`, `/tasks/{id}`,
 * `/runs/{runId}`): 2xl wide, centered, with horizontal padding, so desktop
 * content has equal margins instead of sitting against the left edge
 * (app#2016 item 3). One component so the next page cannot drift.
 */
export default function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-2xl px-6", className)}>
      {children}
    </div>
  );
}
