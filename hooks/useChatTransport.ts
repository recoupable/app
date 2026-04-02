import { useMemo, useCallback } from "react";
import { DefaultChatTransport } from "ai";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { useApiOverride } from "./useApiOverride";
import { usePrivy } from "@privy-io/react-auth";

export function useChatTransport() {
  const apiOverride = useApiOverride();
  const { getAccessToken } = usePrivy();

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
