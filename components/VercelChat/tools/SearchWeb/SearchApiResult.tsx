import React from "react";
import { Globe, Search } from "lucide-react";
import SearchResultItem from "./SearchResultItem";
import { ToolCard } from "../shared/ToolCard";
import ToolEmpty from "../shared/ToolEmpty";
import ToolError from "../shared/ToolError";

export interface ParsedSearchResult {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
  last_updated?: string;
}

export interface SearchApiResultType {
  results: ParsedSearchResult[];
  formatted: string;
}

const SearchApiResult = ({ result }: { result: SearchApiResultType }) => {
  if (!result) {
    return (
      <ToolError
        title="Web search"
        message="We couldn't retrieve search results. Please try again."
      />
    );
  }

  const searchResults: ParsedSearchResult[] = result.results ?? [];
  const hasResults = searchResults.length > 0;

  return (
    <ToolCard
      icon={Globe}
      tone="info"
      title="Sources"
      subtitle={
        hasResults
          ? `${searchResults.length} ${searchResults.length === 1 ? "source" : "sources"} reviewed`
          : "Web search complete"
      }
      trailing={
        hasResults ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {searchResults.length}
          </span>
        ) : undefined
      }
    >
      {hasResults ? (
        <div className="space-y-0.5 p-2">
          {searchResults.map((item, index) => (
            <SearchResultItem key={index} result={item} />
          ))}
        </div>
      ) : (
        <ToolEmpty
          icon={Search}
          title="No results found"
          description="The search didn't return any sources. Try a different query."
        />
      )}
    </ToolCard>
  );
};

export default SearchApiResult;
