"use client";

import { useMemo, useState } from "react";
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
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const youtube = connectors.find((c) => c.slug === "youtube");

  if (isLoading) {
    return null;
  }

  if (!youtube?.isConnected || !youtube.connectedAccountId) {
    return null;
  }

  const handleClick = async () => {
    if (!youtube.connectedAccountId || isDisconnecting) return;
    setIsDisconnecting(true);
    try {
      const ok = await disconnect(youtube.connectedAccountId);
      if (ok) {
        queryClient.invalidateQueries({
          queryKey: ["youtube-channel-info", artistAccountId],
        });
      }
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 cursor-pointer absolute bottom-0 -top-3 -right-1 md:top-[-1rem]">
      <span className={"text-sm"}>&nbsp;</span>
      <Button
        size="icon"
        aria-label="Disconnect YouTube"
        disabled={isDisconnecting}
        className="w-4 h-4 bg-transparent text-red-500 px-1 py-1 rounded-xl hover:bg-red-500 hover:text-white"
        onClick={handleClick}
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default YoutubeLogoutButton;
