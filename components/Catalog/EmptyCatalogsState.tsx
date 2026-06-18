"use client";

import Link from "next/link";
import { Sparkles, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const VALUATION_URL = "https://recoupable.com/valuation";
const AGENT_PROMPT =
  "Help me set up my first catalog and understand what my music is worth.";

/**
 * Onboarding empty state for an account with no catalogs yet. Replaces the bare
 * "No catalogs found." text with a guided next step: run a free valuation (the
 * same flow that materializes a catalog) or ask the agent to help build one.
 */
const EmptyCatalogsState = () => {
  return (
    <div className="rounded-xl bg-card shadow p-8 text-center max-w-xl mx-auto">
      <h2 className="text-lg font-semibold">No catalogs yet</h2>
      <p className="text-sm text-muted-foreground mt-2">
        A catalog is your collection of tracks with their play counts and
        estimated value. Run a free valuation to measure your catalog, or ask the
        agent to help you build one.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Button asChild>
          <a href={VALUATION_URL} target="_blank" rel="noreferrer">
            <BarChart3 />
            Measure your catalog value
          </a>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/?q=${encodeURIComponent(AGENT_PROMPT)}`}>
            <Sparkles />
            Ask the agent
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default EmptyCatalogsState;
