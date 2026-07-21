import { UIMessage, ChatStatus } from "ai";
import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MessageParts } from "./MessageParts";

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
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          key={message.id}
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            },
          )}
        >
          <MessageParts
            message={message}
            mode={mode}
            setMode={setMode}
            status={status}
            reload={reload}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Message;
