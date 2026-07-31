"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import useCatalogs from "./useCatalogs";
import useHomeValuation, { type HomeValuationState } from "./useHomeValuation";
import useMeasuringPoll from "./useMeasuringPoll";
import { getSetupValuationStatus } from "@/lib/onboarding/getSetupValuationStatus";

/**
 * Everything `/setup/valuation` needs: the status to render, the valuation
 * itself, the redirect for accounts with no catalog, and the poll that gets a
 * seeded catalog out of the measuring state.
 *
 * The route used to render a static "Measuring your catalog" panel that never
 * re-checked, because `useCatalogMeasurements` has no `refetchInterval` and the
 * only poller lived in `useCatalogReport`, built for `/catalogs/{id}`. A signup
 * landing here mid-measurement sat there until they refreshed by hand
 * (chat#1912 row 9).
 *
 * Composed as a hook so the route component stays presentational.
 */
const useSetupValuation = (): {
  status: ReturnType<typeof getSetupValuationStatus>;
  valuation: HomeValuationState;
} => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const valuation = useHomeValuation();
  const { data, isPending, isError } = useCatalogs();

  const status = getSetupValuationStatus({
    catalogsPending: isPending,
    catalogsFailed: isError,
    hasCatalog: !!data?.catalogs?.length,
    valuationReady: valuation.show,
  });

  useEffect(() => {
    if (status === "redirect") router.replace("/catalogs");
  }, [status, router]);

  // The measurements query owns the valuation, so invalidating it is what
  // actually re-reads; the catalog list is already correct by this point.
  const refetchMeasurements = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["catalog-measurements"] });
  }, [queryClient]);

  useMeasuringPoll(status === "measuring", refetchMeasurements);

  return { status, valuation };
};

export default useSetupValuation;
