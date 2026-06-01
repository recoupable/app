"use client";

import { useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { useMiniAppContext } from "@/providers/MiniAppProvider";

/** Prompts anonymous visitors to sign in via Privy. Must run under `UserProvider`. */
export function useAutoLogin() {
  const { login } = usePrivy();
  const { email } = useUserProvider();
  const { isMiniApp, isLoading: isMiniAppLoading } = useMiniAppContext();
  const hasTriedLogin = useRef(false);

  useEffect(() => {
    const shouldTryLogin =
      !email && !hasTriedLogin.current && !isMiniApp && !isMiniAppLoading;
    if (!shouldTryLogin) return;
    hasTriedLogin.current = true;
    login();
  }, [email, login, isMiniApp, isMiniAppLoading]);
}

export default useAutoLogin;
