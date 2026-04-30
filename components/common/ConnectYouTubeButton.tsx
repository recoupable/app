"use client";

import { useMemo, useState } from "react";
import { Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConnectors } from "@/hooks/useConnectors";

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
  const { authorize } = useConnectors(config);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleClick = async () => {
    if (!accountId || isConnecting) return;
    setIsConnecting(true);
    try {
      const redirectUrl = await authorize("youtube");
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
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
