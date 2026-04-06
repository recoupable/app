"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useConnectors } from "@/hooks/useConnectors";
import { ALLOWED_ARTIST_CONNECTORS } from "@/lib/composio/allowedArtistConnectors";
import { getArtistSocials } from "@/lib/api/artist/getArtistSocials";
import { matchSocialToConnector } from "@/lib/composio/matchSocialToConnector";
import { ConnectorCard } from "@/components/ConnectorsPage/ConnectorCard";
import { Loader2, Plug } from "lucide-react";

interface ArtistConnectorsTabProps {
  artistAccountId: string;
}

/**
 * Connectors tab content for the Artist Settings modal.
 * Reuses ConnectorCard from the user-level ConnectorsPage (DRY).
 */
export function ArtistConnectorsTab({
  artistAccountId,
}: ArtistConnectorsTabProps) {
  const config = useMemo(
    () => ({
      accountId: artistAccountId,
      allowedSlugs: [...ALLOWED_ARTIST_CONNECTORS],
      callbackUrl: `${window.location.origin}${window.location.pathname}?artist_connected=true&artist_id=${artistAccountId}`,
    }),
    [artistAccountId],
  );
  const { connectors, isLoading, error, authorize, disconnect } =
    useConnectors(config);

  const { data: socialsData } = useQuery({
    queryKey: ["artistSocials", artistAccountId],
    queryFn: () => getArtistSocials(artistAccountId),
    enabled: !!artistAccountId,
    staleTime: 1000 * 60 * 5,
  });

  const socials = socialsData?.socials ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive py-4">
        Failed to load connectors. Please try again.
      </p>
    );
  }

  if (connectors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Plug className="h-8 w-8 mb-2" />
        <p className="text-sm">No connectors available for this artist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      <p className="text-sm text-muted-foreground">
        Connect third-party services so the AI agent can take actions on behalf
        of this artist.
      </p>
      <div className="space-y-2">
        {connectors.map((connector) => {
          const social = matchSocialToConnector(connector.slug, socials);
          return (
            <ConnectorCard
              key={connector.slug}
              connector={connector}
              onConnect={authorize}
              onDisconnect={disconnect}
              socialAvatar={social?.avatar}
              socialUsername={social?.username}
            />
          );
        })}
      </div>
    </div>
  );
}
