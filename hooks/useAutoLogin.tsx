"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { isPublicRoute } from "@/lib/routes/isPublicRoute";
import { useUserProvider } from "@/providers/UserProvder";
import { useMiniAppContext } from "@/providers/MiniAppProvider";

/**
 * Prompts anonymous visitors to sign in via Privy. Must run under
 * `UserProvider`. Public routes are exempt — a shareable page must not
 * open a login modal over its content.
 */
export function useAutoLogin() {
  const { login } = usePrivy();
  const { email } = useUserProvider();
  const { isMiniApp, isLoading: isMiniAppLoading } = useMiniAppContext();
  const pathname = usePathname();
  const hasTriedLogin = useRef(false);

  useEffect(() => {
    const shouldTryLogin =
      !email &&
      !hasTriedLogin.current &&
      !isMiniApp &&
      !isMiniAppLoading &&
      !isPublicRoute(pathname);
    if (!shouldTryLogin) return;
    hasTriedLogin.current = true;
    login();
  }, [email, login, isMiniApp, isMiniAppLoading, pathname]);
}

export default useAutoLogin;
