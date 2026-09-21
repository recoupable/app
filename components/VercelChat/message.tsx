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
    <MessageFrame
      role={message.role as "user" | "assistant"}
      fullWidth={mode === "edit"}
    >
      <div className="min-w-0 flex-1">
        <MessageParts
          message={message}
          mode={mode}
          setMode={setMode}
          status={status}
          reload={reload}
        />
      </div>
    </MessageFrame>
  );
};

export default Message;
