import { useEffect } from "react";

/** A seeded catalog's first measurement lands in roughly a minute. */
const MEASURING_POLL_MS = 5000;

/**
 * Re-reads the measurements while a catalog is still being measured, so the
 * report resolves on its own instead of leaving the owner on an empty page to
 * re-run the whole valuation (chat#1912 row 1).
 *
 * Owns the interval so report components stay presentational.
 */
const useMeasuringPoll = (isMeasuring: boolean, refetch: () => void) => {
  useEffect(() => {
    if (!isMeasuring) return;
    const id = setInterval(refetch, MEASURING_POLL_MS);
    return () => clearInterval(id);
  }, [isMeasuring, refetch]);
};

export default useMeasuringPoll;
