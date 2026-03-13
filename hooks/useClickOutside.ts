import { useEffect, RefObject } from "react";

/**
 * Hook that calls a handler when clicking outside the referenced element.
 *
 * @param ref - React ref to the element to detect clicks outside of
 * @param handler - Callback function to call when clicking outside
 * @param enabled - Whether the listener is active (default: true)
 */
const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void,
  enabled: boolean = true,
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, handler, enabled]);
};

export default useClickOutside;
