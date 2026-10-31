import React from "react";
import SearchResultItem from "./SearchResultItem";

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

export interface SearchApiErrorResult {
  success: false;
  message: string;
}

export interface SearchApiResultProps {
  result: SearchApiResultType | SearchApiErrorResult;
}

const SearchApiResult = ({ result }: SearchApiResultProps) => {
  if (!result || ("success" in result && result.success === false)) {
    const message = result && "success" in result ? result.message : undefined;
    return (
      <div className="py-3 px-4 bg-destructive/10 border border-destructive/30 rounded-lg">
        <p className="text-sm text-destructive-text font-medium">
          {message?.trim() ? message : "Error retrieving search results"}
        </p>
      </div>
    );
  }

  const searchResults: ParsedSearchResult[] = (result as SearchApiResultType)
    .results;

  if (searchResults.length === 0) {
    return (
      <div className="py-3 px-4">
        <p className="text-sm text-muted-foreground">
          No search results found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Sources · {searchResults.length}
      </p>

      <div className="space-y-1">
        {searchResults.map((item, index) => (
          <SearchResultItem key={index} result={item} />
        ))}
      </div>
    </div>
  );
};

export default SearchApiResult;
