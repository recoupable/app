import { useMediaQuery } from "usehooks-ts";

/**
 * Viewport check for the mobile breakpoint.
 *
 * `initializeWithValue: false` is required, not cosmetic. usehooks-ts defaults
 * it to true, which evaluates `window.matchMedia` during the first render —
 * including the hydration render. The server has no matchMedia and renders the
 * desktop branch, so on a narrow viewport the client's first render disagreed
 * and `Header` emitted an "Add Your Artist" button the server never sent.
 * React treated that as a hydration mismatch (#418) and regenerated the entire
 * tree on every page load (chat#1912 row 5). With this off the first render
 * matches the server, and the real value arrives in an effect.
 */
const useIsMobile = () => {
  const isMobile = useMediaQuery("(max-width: 768px)", {
    initializeWithValue: false,
  });

  return isMobile;
};

export default useIsMobile;
