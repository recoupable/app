"use client";

import { useMemo } from "react";
import { Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConnectors } from "@/hooks/useConnectors";
import { useConnectorHandlers } from "@/hooks/useConnectorHandlers";

interface ConnectYouTubeButtonProps {
  accountId?: string;
  className?: string;
  size?: "sm" | "lg" | "default" | "icon";
  disabled?: boolean;
  dense?: boolean;
}

export const ConnectYouTubeButton = ({
  accountId,
  className = "",
  size = "default",
  disabled = false,
  dense = false,
}: ConnectYouTubeButtonProps) => {
  const config = useMemo(
    () => ({
      accountId,
      allowedSlugs: ["youtube"] as string[],
      callbackUrl:
        typeof window !== "undefined"
          ? `${window.location.origin}${window.location.pathname}?artist_connected=true&artist_id=${accountId ?? ""}`
          : undefined,
    }),
    [accountId],
  );
  const { authorize, disconnect } = useConnectors(config);
  const { isConnecting, handleConnect } = useConnectorHandlers({
    slug: "youtube",
    onConnect: authorize,
    onDisconnect: disconnect,
  });

  return (
    <Button
      onClick={handleConnect}
      aria-label="Connect YouTube Account"
      className={cn(
        "bg-red-600 hover:bg-red-700 text-white flex items-center justify-center",
        { "rounded-full px-2": dense },
        className,
      )}
      size={size}
      disabled={disabled || !accountId || isConnecting}
    >
      <Youtube className={cn("h-4 w-4", { "mr-0 md:mr-0": dense })} />
      <span className={cn("text-xs md:text-sm", { hidden: dense })}>
        Connect YouTube <span className="hidden md:inline">Account</span>
      </span>
    </Button>
  );
};
