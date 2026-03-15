import streamPerplexityApi from "./streamPerplexityApi";
import { PerplexityMessage, PerplexityStreamChunk, StreamedResponse } from "./types";

/**
 *
 * @param messages
 * @param model
 */
async function* streamChatCompletion(
  messages: PerplexityMessage[],
  model: string = "sonar-pro",
): AsyncGenerator<string, StreamedResponse, undefined> {
  const response = await streamPerplexityApi(messages, model);

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullContent = "";
  const searchResults: StreamedResponse["searchResults"] = [];
  const citations: string[] = [];
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim() || !line.startsWith("data: ")) continue;

        const dataStr = line.slice(6);

        if (dataStr === "[DONE]") continue;

        try {
          const data: PerplexityStreamChunk = JSON.parse(dataStr);

          const content = data.choices[0]?.delta?.content;
          if (content) {
            fullContent += content;
            yield content;
          }

          if (data.search_results && data.search_results.length > 0) {
            searchResults.push(...data.search_results);
          }

          if (data.citations && data.citations.length > 0) {
            citations.push(...data.citations);
          }
        } catch {
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    content: fullContent,
    searchResults,
    citations,
  };
}

export default streamChatCompletion;
