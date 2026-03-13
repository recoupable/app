import { useEffect, useRef } from "react";

/**
 * Returns a ref to attach to a scrollable container.
 * Automatically scrolls to the bottom whenever the dependency changes.
 *
 * @param dep
 */
export function useAutoScroll<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);

  return ref;
}
