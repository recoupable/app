import { useMemo } from "react";
import { useConnectors } from "./useConnectors";

interface YoutubeStatusData {
  status: "valid" | "invalid" | "error";
  connectedAccountId?: string;
  artistAccountId: string;
}

/**
 * YouTube connection status for an artist account, derived from the
 * Composio connectors list. Returns `valid` when YouTube is connected,
 * `invalid` otherwise.
 */
const useYoutubeStatus = (artistAccountId?: string) => {
  const config = useMemo(
    () => ({
      accountId: artistAccountId,
      allowedSlugs: ["youtube"] as string[],
    }),
    [artistAccountId],
  );
  const { connectors, isLoading, error } = useConnectors(config);

  const data: YoutubeStatusData | null = artistAccountId
    ? {
        status: error
          ? "error"
          : connectors.find((c) => c.slug === "youtube")?.isConnected
            ? "valid"
            : "invalid",
        connectedAccountId: connectors.find((c) => c.slug === "youtube")
          ?.connectedAccountId,
        artistAccountId,
      }
    : null;

  return { data, isLoading, error };
};

export default useYoutubeStatus;
