import { useState, useEffect } from "react";

type UseVisibilityDelayOptions = {
  /**
   * Whether the conditions for showing content are met
   */
  shouldBeVisible: boolean;

  /**
   * Delay in milliseconds before showing content
   * @default 300
   */
  delay?: number;

  /**
   * Dependencies to watch for changes
   * @default []
   */
  deps?: ReadonlyArray<unknown>;
};

/**
 * Hook to handle delayed visibility transitions
 *
 * @example
 * const { isVisible } = useVisibilityDelay({
 *   shouldBeVisible: !!userData && !!artistData,
 *   deps: [userData?.name, artistData?.name]
 * });
 */
export function useVisibilityDelay({
  shouldBeVisible,
  delay = 300,
  deps = [],
}: UseVisibilityDelayOptions) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only proceed if conditions are met
    if (!shouldBeVisible) {
      setIsVisible(false);
      return;
    }

    // Add delay for smoother transition
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldBeVisible, delay, ...deps]);

  return { isVisible };
}

export default useVisibilityDelay;
