import { useMemo, useCallback } from "react";
import { DefaultChatTransport } from "ai";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { usePrivy } from "@privy-io/react-auth";
import { useApiOverride } from "./useApiOverride";

export function useChatTransport() {
  const { getAccessToken } = usePrivy();
  const apiOverride = useApiOverride();

  const baseUrl = apiOverride || NEW_API_BASE_URL;

  const getHeaders = useCallback(async () => {
    const accessToken = await getAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  }, [getAccessToken]);

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: `${baseUrl}/api/chat`,
    });
  }, [baseUrl]);

  return { transport, getHeaders };
}
