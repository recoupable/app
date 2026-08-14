"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * One fresh catalogs read per landing for the onboarding state path only:
 * `useCatalogs` keeps its 5-minute staleTime for every other consumer, but
 * the derived onboarding step must see out-of-band claims (valuation
 * auto-claim, chat, API) immediately, so mounting the onboarding consumer
 * invalidates the cached entry and lets the active query refetch.
 */
export function useRefreshCatalogsOnLanding(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["catalogs"] });
  }, [queryClient]);
}
