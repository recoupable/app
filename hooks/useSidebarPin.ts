import { useState, useEffect } from "react";

const STORAGE_KEY = "sidebar-pinned";

/**
 * Persists the sidebar pinned state across page refreshes via localStorage.
 * State is initialized after hydration to avoid SSR/client mismatch in Next.js.
 */
const useSidebarPin = () => {
  const [isPinned, setIsPinned] = useState(false);

  // Read persisted value after mount so server and client start with the same
  // initial state (false), preventing a hydration mismatch.
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true") {
        setIsPinned(true);
      }
    } catch {
      // localStorage may be restricted in some environments; fail silently.
    }
  }, []);

  // Write back to localStorage whenever the value changes.
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, String(isPinned));
      }
    } catch {
      // localStorage may be restricted in some environments; fail silently.
    }
  }, [isPinned]);

  const togglePin = () => setIsPinned((prev) => !prev);

  return { isPinned, togglePin };
};

export default useSidebarPin;
