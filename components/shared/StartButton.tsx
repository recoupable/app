"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import trackSignupStarted from "@/lib/analytics/trackSignupStarted";

export function StartButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { login, authenticated } = usePrivy();

  const handleClick = async () => {
    if (!authenticated) {
      trackSignupStarted("start_button");
      login();
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/agentkit/run");
      const data = await response.json();
      if (data.walletAddress) {
        setWalletAddress(data.walletAddress);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={handleClick}
        size="lg"
        className="px-12 py-6 text-lg font-semibold hover:scale-105 transition-transform"
        disabled={isLoading}
      >
        {isLoading ? "Running..." : "Start"}
      </Button>
      {walletAddress && (
        <div className="mt-4 p-4 bg-muted rounded-lg border">
          <p className="text-sm text-muted-foreground mb-1">
            Your Agent&apos;s Wallet Address:
          </p>
          <p className="font-mono text-sm break-all">{walletAddress}</p>
        </div>
      )}
    </div>
  );
}
