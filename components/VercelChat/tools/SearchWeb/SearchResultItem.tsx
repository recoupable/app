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

function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result }) => {
  const domain = getDomain(result.url);
  const faviconUrl = getFaviconUrl(domain);
  const date = formatDate(result.date) ?? formatDate(result.last_updated);

  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl}
          alt=""
          className="size-4"
          onError={(e) => {
            e.currentTarget.src = getFallbackFaviconUrl();
          }}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{domain}</span>
          {date ? (
            <>
              <span aria-hidden className="text-muted-foreground/50">
                ·
              </span>
              <span className="shrink-0">{date}</span>
            </>
          ) : null}
        </div>

        <p className="mt-0.5 line-clamp-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
          {result.title}
        </p>

        {result.snippet ? (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {result.snippet}
          </p>
        ) : null}
      </div>
    </a>
  );
};

export default SearchResultItem;
