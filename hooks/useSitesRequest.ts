import { usePrivy } from "@privy-io/react-auth";
import { useCallback } from "react";
export function useSitesRequest() {
  const { getAccessToken } = usePrivy();
  return useCallback(
    async <T>(path: string, init: RequestInit = {}): Promise<T> => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const token = await Promise.race([
        getAccessToken(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () =>
              reject(
                new Error(
                  "Your sign-in session is not responding. Reload the page and try again.",
                ),
              ),
            20000,
          );
        }),
      ]).finally(() => clearTimeout(timer));
      if (!token) throw new Error("Please sign in to manage sites.");
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${token}`);
      if (init.body && !(init.body instanceof FormData))
        headers.set("Content-Type", "application/json");
      const response = await fetch(path, {
        ...init,
        headers,
        signal: init.signal ?? AbortSignal.timeout(150000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Something went wrong. Please try again.",
        );
      return result as T;
    },
    [getAccessToken],
  );
}
