import { useMemo } from "react";
import { DefaultChatTransport } from "ai";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { useApiOverride } from "./useApiOverride";
import { usePrivy } from "@privy-io/react-auth";

export function useChatTransport() {
  const apiOverride = useApiOverride();
  const { getAccessToken } = usePrivy();

  const baseUrl = apiOverride || NEW_API_BASE_URL;

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: `${baseUrl}/api/chat`,
      prepareSendMessagesRequest: async ({ body, headers }) => {
        const token = await getAccessToken().catch(() => null);
        const resolvedHeaders = new Headers(headers);

        if (token) {
          resolvedHeaders.set("Authorization", `Bearer ${token}`);
        }

        return { body: body ?? {}, headers: resolvedHeaders };
      },
    });
  }, [baseUrl, getAccessToken]);

  return { transport };
}
