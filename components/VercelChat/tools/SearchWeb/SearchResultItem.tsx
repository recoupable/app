import React from "react";
import {
  getDomain,
  getFaviconUrl,
  getFallbackFaviconUrl,
} from "@/lib/search/urlUtils";
import type { ParsedSearchResult } from "./SearchApiResult";

interface SearchResultItemProps {
  result: ParsedSearchResult;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result }) => {
  const domain = getDomain(result.url);
  const faviconUrl = getFaviconUrl(domain);

  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-muted dark:hover:bg-zinc-900 transition-colors group focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <img
          src={faviconUrl}
          alt=""
          className="w-4 h-4 flex-shrink-0"
          onError={(e) => {
            e.currentTarget.src = getFallbackFaviconUrl();
          }}
        />
        <span className="text-sm font-medium text-foreground dark:text-foreground truncate group-hover:text-primary transition-colors">
          {result.title}
        </span>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {domain}
      </span>
    </a>
  );
};

export default SearchResultItem;
