"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { getRuns, type ValuationRun } from "@/lib/runs/getRuns";
import { getRunPollInterval } from "@/lib/runs/getRunPollInterval";

/**
 * The account's latest valuation run (chat#1973): one shared read of
 * `GET /api/runs?kind=valuation` behind every status surface. Polls only
 * while a run is in flight, and refreshes the catalog reads when a run
 * reaches `claimed` so surfaces settle into the result without a manual
 * refresh. The hook keys off `run.state` only — never storage details.
 */
const useValuationRunStatus = (): {
  run: ValuationRun | undefined;
  isInFlight: boolean;
} => {
  const { getAccessToken, authenticated } = usePrivy();
  const { userData } = useUserProvider();
  const accountId = userData?.account_id || "";
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["runs", accountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No access token");
      return getRuns(accessToken);
    },
    enabled: !!accountId && authenticated,
    refetchInterval: (query) => getRunPollInterval(query.state.data?.runs?.[0]),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const run = data?.runs?.[0];

  // A run just landed: the catalog reads are stale the moment it is claimed.
  // Any observed in-flight phase counts — a fast run can jump queued →
  // claimed between polls. A run first observed already claimed does not
  // invalidate: nothing this mount showed predates it.
  const previousState = useRef<ValuationRun["state"] | undefined>(undefined);
  useEffect(() => {
    const wasInFlight =
      previousState.current === "measuring" || previousState.current === "queued";
    if (run?.state === "claimed" && wasInFlight) {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      queryClient.invalidateQueries({ queryKey: ["catalog-measurements"] });
    }
    previousState.current = run?.state;
  }, [run?.state, queryClient]);

  return {
    run,
    isInFlight: run?.state === "queued" || run?.state === "measuring",
  };
};

export default useValuationRunStatus;
