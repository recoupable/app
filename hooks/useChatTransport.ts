import { useMemo } from "react";
import { DefaultChatTransport } from "ai";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { useAccessToken } from "./useAccessToken";
import { useApiOverride } from "./useApiOverride";

/**
 *
 */
export function useChatTransport() {
  const accessToken = useAccessToken();
  const apiOverride = useApiOverride();

  const baseUrl = apiOverride || NEW_API_BASE_URL;

  const headers = useMemo(() => {
    return accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined;
  }, [accessToken]);

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: `${baseUrl}/api/chat`,
      ...(headers && { headers }),
    });
  }, [baseUrl, headers]);

  return { transport, headers };
}
