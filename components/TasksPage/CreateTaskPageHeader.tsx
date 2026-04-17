import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CreateTaskPageHeaderProps {
  title: string;
  description: string;
  accountIdOverride: string | null;
  /** Shown when `accountIdOverride` is set (e.g. email resolved for override). */
  overrideDisplay: string | null;
}

export function CreateTaskPageHeader({
  title,
  description,
  accountIdOverride,
  overrideDisplay,
}: CreateTaskPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-left font-heading text-3xl font-bold dark:text-white mb-4">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground text-left font-light font-sans max-w-2xl">
          {description}
        </p>
        {accountIdOverride ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Creating as override account:{" "}
            <span className="font-mono">
              {overrideDisplay || accountIdOverride}
            </span>
          </p>
        ) : null}
      </div>
      <Button asChild variant="outline" className="w-full sm:w-auto">
        <Link href="/tasks">Back to Tasks</Link>
      </Button>
    </div>
  );
}
