"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccessToken } from "@/hooks/useAccessToken";
import { setupSandbox } from "@/lib/sandboxes/setupSandbox";

const SESSION_KEY = "sandboxSetupDone";

export function useSandboxSetupOnLogin() {
  const { authenticated } = usePrivy();
  const accessToken = useAccessToken();

  useEffect(() => {
    if (!authenticated || !accessToken) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (window.sessionStorage.getItem(SESSION_KEY) === "1") {
      return;
    }

    setupSandbox(accessToken)
      .then(() => {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      })
      .catch((error) => {
        // We deliberately log and continue so login UX is not blocked
        console.error("Failed to setup sandbox on login:", error);
      });
  }, [authenticated, accessToken]);
}

