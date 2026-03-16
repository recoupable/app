import { z } from "zod";
import { tool } from "ai";
import streamChatCompletion from "@/lib/perplexity/streamChatCompletion";
import type { SearchProgress } from "./types";

// Batch size for streaming updates - set to 1 for immediate UI updates
const CHUNK_BATCH_SIZE = 1;

const getWebDeepResearchTool = (model: string = "sonar-deep-research") => {
  return tool({
    description:
      "Deep web research tool for comprehensive, multi-source analysis. " +
      "Use this when you need thorough research on complex topics that require synthesizing information from many sources. " +
      "This tool performs more extensive research than the standard web search. " +
      "Accepts an array of messages and streams comprehensive research results with citations.",
    inputSchema: z.object({
      messages: z.array(
        z.object({
          role: z.string(),
          content: z.string(),
        }),
      ),
    }),
    execute: async function* ({ messages }) {
      if (!Array.isArray(messages)) {
        throw new Error("Invalid arguments for web_deep_research: 'messages' must be an array");
      }

      const query = messages[messages.length - 1]?.content || "research query";

      // Initial searching status
      yield {
        status: "searching" as const,
        message: "Conducting deep research...",
        query,
      } satisfies SearchProgress;

      try {
        const stream = streamChatCompletion(messages, model);
        let accumulatedContent = "";
        let chunkCount = 0;
        let finalMetadata;

        // Manually iterate to capture both yielded values and return value
        let hasYieldedSources = false;

        while (true) {
          const { value, done } = await stream.next();

          if (done) {
            // value here is the return value (StreamedResponse)
            finalMetadata = value;
            break;
          }

          // value here is a yielded content chunk
          accumulatedContent += value;
          chunkCount++;

          // Yield streaming progress every CHUNK_BATCH_SIZE chunks
          if (chunkCount % CHUNK_BATCH_SIZE === 0) {
            yield {
              status: "streaming" as const,
              message: "Analyzing sources...",
              query,
              accumulatedContent,
            } satisfies SearchProgress;
          }
        }

        // Extract metadata from final result
        const searchResults = finalMetadata?.searchResults || [];
        const finalCitations = finalMetadata?.citations || [];

        // If we got search results, yield a reviewing status
        if (searchResults.length > 0 && !hasYieldedSources) {
          hasYieldedSources = true;
          yield {
            status: "reviewing" as const,
            message: `Reviewing sources · ${searchResults.length}`,
            query,
            searchResults,
          } satisfies SearchProgress;
        }

        // Use the full content from metadata if available
        if (finalMetadata?.content) {
          accumulatedContent = finalMetadata.content;
        }

        // Yield final streaming update if we didn't just yield one
        if (chunkCount % CHUNK_BATCH_SIZE !== 0) {
          yield {
            status: "streaming" as const,
            message: "Analyzing sources...",
            query,
            accumulatedContent,
          } satisfies SearchProgress;
        }

        // Append citations to final content
        let finalContent = accumulatedContent;
        if (finalCitations.length > 0) {
          finalContent += "\n\nCitations:\n";
          finalCitations.forEach((citation, index) => {
            finalContent += `[${index + 1}] ${citation}\n`;
          });
        }

        // Yield complete status
        yield {
          status: "complete" as const,
          message: "Research complete",
          query,
          accumulatedContent: finalContent,
          citations: finalCitations,
        } satisfies SearchProgress;

        // Return final result for AI model
        return {
          content: [{ type: "text", text: finalContent }],
          isError: false,
        };
      } catch (error) {
        throw new Error(`Deep research failed: ${error}`);
      }
    },
  });
};

export default getWebDeepResearchTool;
