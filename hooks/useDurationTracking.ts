/**
 * Duration Tracking Hook
 * 
 * Tracks how long a streaming/thinking process takes.
 * Single responsibility: Time duration of streaming operations.
 */

import { useEffect, useState } from 'react';

const MS_IN_S = 1000;

interface UseDurationTrackingReturn {
  duration: number;
  startTime: number | null;
}

/**
 * Hook to track duration of streaming operations
 * @param isStreaming - Whether the operation is currently streaming
 * @returns Object with duration in seconds and start time
 */
export function useDurationTracking(isStreaming: boolean): UseDurationTrackingReturn {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isStreaming) {
      if (startTime === null) {
        setStartTime(Date.now());
      }
    } else if (startTime !== null) {
      setDuration(Math.round((Date.now() - startTime) / MS_IN_S));
      setStartTime(null);
    }
  }, [isStreaming, startTime]);

  return { duration, startTime };
}

export default useDurationTracking;
