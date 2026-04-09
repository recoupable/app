import generateUUID from "@/lib/generateUUID";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { TextUIPart } from "ai";
import { useEffect, useState } from "react";

export type Suggestion = {
  text: string;
  type: "youtube" | "tiktok" | "instagram" | "spotify" | "other";
};

const usePromptSuggestions = () => {
  const { messages, status, append } = useVercelChatContext();
  const isMessageLoading = status === "submitted" || status === "streaming";
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const lastMessage = messages[messages.length - 1];
  const isAssistantMessage = lastMessage?.role === "assistant";
  const [isLoading, setIsLoading] = useState(false);

  const content = (lastMessage?.parts[0] as TextUIPart)?.text || "";

  const handleSuggestionClick = (suggestion: string) => {
    append({
      id: generateUUID(),
      role: "user",
      parts: [{ type: "text", text: suggestion }],
    });
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/prompts/suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setIsLoading(false);
      }
    };

    if (!isMessageLoading && content && isAssistantMessage) {
      fetchSuggestions();
    }
    if (isMessageLoading) {
      setSuggestions([]);
    }
  }, [content, isMessageLoading, isAssistantMessage]);

  const effectiveSuggestions = messages.length <= 0 ? [] : suggestions;
  const shouldShowStrip =
    isAssistantMessage &&
    (isLoading || effectiveSuggestions.length > 0);

  return {
    suggestions: effectiveSuggestions,
    handleSuggestionClick,
    isLoading,
    isHidden: !shouldShowStrip,
  };
};

export default usePromptSuggestions;
