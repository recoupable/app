import React from "react";
import { Loader } from "lucide-react";
import { Response } from "@/components/ai-elements/response";
import { SearchProgress } from "@/lib/search/searchProgressUtils";
import SearchResultItem from "./SearchResultItem";
import SearchQueryPill from "./SearchQueryPill";

interface SearchWebProgressProps {
  progress: SearchProgress;
}

export const SearchWebProgress: React.FC<SearchWebProgressProps> = ({ progress }) => {
  // Searching state: Display the query being searched
  if (progress.status === 'searching') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Searching</p>
        <div className="space-y-1">
          <SearchQueryPill query={progress.query || ''} />
        </div>
      </div>
    );
  }

  // Reviewing state: Display query pill AND list of sources being reviewed
  if (progress.status === 'reviewing') {
    const searchResults = progress.searchResults || [];

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Searching</p>
        <div className="space-y-1">
          <SearchQueryPill query={progress.query || ''} />
        </div>
        
        <p className="text-sm text-muted-foreground">
          Reviewing sources · {searchResults.length}
        </p>
        
        <div className="border border-border dark:border-zinc-800 rounded-lg overflow-hidden bg-card">
          {searchResults.map((item, index) => (
            <SearchResultItem 
              key={index} 
              result={item}
            />
          ))}
        </div>
      </div>
    );
  }

  // Streaming state: Display accumulated content as it streams
  if (progress.status === 'streaming') {
    return (
      <div className="flex flex-col gap-3 py-3 px-4 bg-primary/5 rounded-lg border">
        <div className="flex items-center gap-2">
          <Loader className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">{progress.message}</span>
        </div>
        {progress.accumulatedContent && (
          <Response className="w-full">{progress.accumulatedContent}</Response>
        )}
      </div>
    );
  }

  // Complete state: Don't show anything (final result handled by SearchWebResult)
  if (progress.status === 'complete') {
    return null;
  }

  // Fallback for unknown status
  return null;
};

export default SearchWebProgress;

