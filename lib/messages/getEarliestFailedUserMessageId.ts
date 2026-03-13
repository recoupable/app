import { isToolUIPart, UIMessage } from "ai";

const getEarliestFailedUserMessageId = (messages: UIMessage[]): string | null => {
  if (!messages || messages.length === 0) {
    return null;
  }

  // Track earliest user message since last successful assistant message
  let earliestUserMessageSinceLastSuccess: string | null = null;

  for (let i = 0; i < messages.length; i++) {
    const currentMessage = messages[i];

    if (currentMessage.role === "user") {
      // Only store if we don't already have one since last successful assistant message
      if (earliestUserMessageSinceLastSuccess === null) {
        earliestUserMessageSinceLastSuccess = currentMessage.id;
      }

      const isLastMessage = i === messages.length - 1;
      const isNextMessageUser = messages[i + 1]?.role === "user";
      const hasNoAssistantMessages = !messages.some(msg => msg.role === "assistant");
      if (isLastMessage || isNextMessageUser) {
        if (hasNoAssistantMessages) {
          // Return the earliest user message if no assistant messages exist
          const earliestUserMessage = messages.find(msg => msg.role === "user");
          return earliestUserMessage?.id || null;
        }
      }
      continue;
    }

    // For assistant messages, check if it's successful
    if (currentMessage.role === "assistant") {
      const isContentEmpty = !currentMessage.parts.filter(part => part.type === "text").join("");
      if (isContentEmpty) {
        return earliestUserMessageSinceLastSuccess;
      }

      // Check if all tool invocations in parts have state: "result"
      const toolParts = currentMessage.parts?.filter(part => isToolUIPart(part));

      if (toolParts && toolParts.length > 0) {
        const allToolsSuccessful = toolParts.every(part => part.state === "output-available");
        if (!allToolsSuccessful) {
          return earliestUserMessageSinceLastSuccess;
        }
      }

      // If we reach here, this assistant message was successful
      // Reset the earliest user message tracking
      earliestUserMessageSinceLastSuccess = null;
    }
  }

  // If we get here, all assistant messages were successful (or there were none)
  // Return null to indicate no failures were found
  return null;
};

export default getEarliestFailedUserMessageId;
