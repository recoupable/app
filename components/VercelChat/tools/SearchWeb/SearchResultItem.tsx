import React from "react";
import { ArrowUpRight } from "lucide-react";
import {
  getDomain,
  getFaviconUrl,
  getFallbackFaviconUrl,
} from "@/lib/search/urlUtils";
import type { ParsedSearchResult } from "./SearchApiResult";

interface SearchResultItemProps {
  result: ParsedSearchResult;
  /** Optional 1-based citation index rendered as a numbered badge. */
  index?: number;
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

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  index,
}) => {
  const domain = getDomain(result.url);
  const faviconUrl = getFaviconUrl(domain);
  const date = formatDate(result.date) ?? formatDate(result.last_updated);
  const initial = (domain || result.title || "?").charAt(0).toUpperCase();

  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
        {/* Letter fallback sits beneath the favicon; if the favicon loads it covers this. */}
        <span aria-hidden className="absolute">
          {initial}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl}
          alt=""
          className="relative size-4 bg-muted"
          onError={(e) => {
            e.currentTarget.src = getFallbackFaviconUrl();
          }}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {typeof index === "number" ? (
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-semibold tabular-nums text-blue-600 dark:text-blue-400">
              {index}
            </span>
          ) : null}
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

        <p className="mt-0.5 flex items-center gap-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
          <span className="line-clamp-1 transition-transform duration-200 group-hover:translate-x-0.5">
            {result.title}
          </span>
          <ArrowUpRight className="size-3.5 shrink-0 -translate-x-1 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
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
