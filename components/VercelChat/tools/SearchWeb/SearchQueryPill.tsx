"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchQueryPillProps {
  query: string;
  /** Animate the pill (shimmer sweep + icon nudge) while the query is in flight. */
  active?: boolean;
}

const SearchQueryPill: React.FC<SearchQueryPillProps> = ({
  query,
  active = false,
}) => {
  const reduce = useReducedMotion();
  return (
    <div className="relative inline-flex max-w-full items-center gap-1.5 overflow-hidden rounded-full border border-border bg-muted/60 px-3 py-1 text-sm text-foreground">
      {active && !reduce ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
          animate={{ x: ["0%", "400%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      <Search
        className={cn(
          "size-3.5 shrink-0 text-muted-foreground",
          active && "text-foreground",
        )}
      />
      <span className="relative truncate" title={query}>
        {query}
      </span>
    </div>
  );
};

export default SearchQueryPill;
