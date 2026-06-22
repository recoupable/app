"use client";

import React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { Search, Globe, Sparkles } from "lucide-react";
import { Response } from "@/components/ai-elements/response";
import { SearchProgress } from "@/lib/search/searchProgressUtils";
import SearchResultItem from "./SearchResultItem";
import SearchQueryPill from "./SearchQueryPill";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";

interface SearchWebProgressProps {
  progress: SearchProgress;
}

/** Small animated integer that tweens toward `value` whenever it changes. */
const CountUp: React.FC<{ value: number }> = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span className="tabular-nums">{rounded}</motion.span>;
};

export const SearchWebProgress: React.FC<SearchWebProgressProps> = ({
  progress,
}) => {
  // Searching state: Display the query being searched.
  if (progress.status === "searching") {
    return (
      <ToolCard
        icon={Search}
        tone="info"
        loading
        title="Searching the web"
        subtitle="Looking for relevant sources…"
      >
        {progress.query ? (
          <ToolCardBody>
            <SearchQueryPill query={progress.query} active />
          </ToolCardBody>
        ) : null}
      </ToolCard>
    );
  }

  // Reviewing state: Display query pill AND list of sources as they stream in.
  if (progress.status === "reviewing") {
    const searchResults = progress.searchResults || [];

    return (
      <ToolCard
        icon={Globe}
        tone="info"
        loading
        title="Reviewing sources"
        subtitle={`${searchResults.length} ${searchResults.length === 1 ? "source" : "sources"} found`}
        trailing={
          <span className="flex min-w-6 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            <CountUp value={searchResults.length} />
          </span>
        }
      >
        <ToolCardBody className="space-y-3">
          {progress.query ? (
            <SearchQueryPill query={progress.query} active />
          ) : null}
          <div className="space-y-0.5">
            <AnimatePresence initial={false}>
              {searchResults.map((item, index) => (
                <motion.div
                  key={item.url ?? index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.24,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <SearchResultItem result={item} index={index + 1} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ToolCardBody>
      </ToolCard>
    );
  }

  // Streaming state: Display accumulated content as it streams.
  if (progress.status === "streaming") {
    return (
      <ToolCard
        icon={Sparkles}
        tone="info"
        loading
        title="Synthesizing answer"
        subtitle={progress.message || "Writing a response from your sources…"}
      >
        {progress.accumulatedContent ? (
          <ToolCardBody>
            <Response className="w-full">
              {progress.accumulatedContent}
            </Response>
          </ToolCardBody>
        ) : null}
      </ToolCard>
    );
  }

  // Complete state: Don't show anything (final result handled by SearchWebResult).
  if (progress.status === "complete") {
    return null;
  }

  // Fallback for unknown status.
  return null;
};

export default SearchWebProgress;
