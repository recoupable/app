import { UIMessage, ChatStatus } from "ai";
import { useState } from "react";
import { MessageParts } from "./MessageParts";
import MessageFrame from "./MessageFrame";

const Message = ({
  message,
  status,
  reload,
}: {
  message: UIMessage;
  /** Injected when rendered outside a VercelChatProvider (onboarding pre-run). */
  status?: ChatStatus;
  reload?: () => void;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <MessageFrame role={message.role as "user" | "assistant"} fullWidth={mode === "edit"}>
      <MessageParts
        message={message}
        mode={mode}
        setMode={setMode}
        status={status}
        reload={reload}
      />
    </MessageFrame>
  );
};

export default Message;
