import { cn } from "@/lib/utils";

interface AgentsVisibilityFilterProps {
  isPrivate: boolean;
  togglePrivate: () => void;
}

const AgentsVisibilityFilter = ({
  isPrivate,
  togglePrivate,
}: AgentsVisibilityFilterProps) => {
  return (
    <div
      role="group"
      aria-label="Agent visibility filter"
      className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
    >
      <button
        type="button"
        aria-pressed={!isPrivate}
        onClick={() => {
          if (isPrivate) togglePrivate();
        }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all cursor-pointer",
          !isPrivate
            ? "bg-background text-foreground shadow"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Public
      </button>
      <button
        type="button"
        aria-pressed={isPrivate}
        onClick={() => {
          if (!isPrivate) togglePrivate();
        }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all cursor-pointer",
          isPrivate
            ? "bg-background text-foreground shadow"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Private
      </button>
    </div>
  );
};

export default AgentsVisibilityFilter;
