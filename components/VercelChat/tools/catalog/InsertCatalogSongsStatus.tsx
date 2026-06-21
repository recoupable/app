import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsertCatalogSongsStatusProps {
  hasError: boolean;
  errorMessage?: string | null;
  successMessage?: string;
}

/**
 * Displays the status of catalog song insertion.
 * Shows either a success or error pill with an appropriate icon and message,
 * using shared design tokens so it reads consistently in light/dark mode.
 */
export default function InsertCatalogSongsStatus({
  hasError,
  errorMessage,
  successMessage,
}: InsertCatalogSongsStatusProps) {
  const isError = hasError;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-3 py-2",
        isError
          ? "border-destructive/20 bg-destructive/5"
          : "border-emerald-500/20 bg-emerald-500/5",
      )}
    >
      <div
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full",
          isError
            ? "bg-destructive/10 text-destructive"
            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        )}
      >
        {isError ? (
          <X className="size-3" strokeWidth={3} />
        ) : (
          <Check className="size-3" strokeWidth={3} />
        )}
      </div>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          isError
            ? "text-destructive"
            : "text-foreground",
        )}
        title={
          (isError ? errorMessage : successMessage) || undefined
        }
      >
        {isError
          ? errorMessage || "Something went wrong adding songs"
          : successMessage || "Songs added to catalog"}
      </span>
    </div>
  );
}
