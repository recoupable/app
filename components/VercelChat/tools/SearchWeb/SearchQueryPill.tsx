import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchQueryPillProps {
  query: string;
  /** Show an animated pulse on the icon while the query is in flight. */
  active?: boolean;
}

const SearchQueryPill: React.FC<SearchQueryPillProps> = ({
  query,
  active = false,
}) => {
  return (
    <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-sm text-foreground">
      <Search
        className={cn(
          "size-3.5 shrink-0 text-muted-foreground",
          active && "animate-pulse text-foreground",
        )}
      />
      <span className="truncate" title={query}>
        {query}
      </span>
    </div>
  );
};

export default SearchQueryPill;
