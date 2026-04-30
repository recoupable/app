"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useConnectors } from "@/hooks/useConnectors";

const YoutubeLogoutButton = ({
  artistAccountId,
}: {
  artistAccountId: string;
}) => {
  const queryClient = useQueryClient();
  const config = useMemo(
    () => ({
      accountId: artistAccountId,
      allowedSlugs: ["youtube"] as string[],
    }),
    [artistAccountId],
  );
  const { connectors, isLoading, disconnect } = useConnectors(config);
  const youtube = connectors.find((c) => c.slug === "youtube");

  if (isLoading) {
    return null;
  }

  if (!youtube?.isConnected || !youtube.connectedAccountId) {
    return null;
  }

  const handleClick = async () => {
    if (!youtube.connectedAccountId) return;
    const ok = await disconnect(youtube.connectedAccountId);
    if (ok) {
      queryClient.invalidateQueries({
        queryKey: ["youtube-channel-info", artistAccountId],
      });
    }
  };

  return (
    <div className="flex flex-col gap-1 cursor-pointer absolute bottom-0 -top-3 -right-1 md:top-[-1rem]">
      <label className={"text-sm"}>&nbsp;</label>
      <Button
        size="icon"
        className="w-4 h-4 bg-transparent text-red-500 px-1 py-1 rounded-xl hover:bg-red-500 hover:text-white"
        onClick={handleClick}
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default YoutubeLogoutButton;
