import { ResumableChat } from "@/lib/chat/ResumableChat";
import type { ChatInit, UIMessage } from "ai";
import { createWorkflowChatTransport } from "@/lib/chat/createWorkflowChatTransport";

export function syntheticChat(
  options: Pick<ChatInit<UIMessage>, "messages" | "onData"> = {},
) {
  return new ResumableChat({
    id: "synthetic-chat",
    transport: createWorkflowChatTransport({
      baseUrl: "https://recoup.invalid",
      getIds: () => ({
        chatId: "synthetic-chat",
        sessionId: "synthetic-session",
      }),
      getAccessToken: async () => "synthetic-token",
    }),
    ...options,
  });
}
