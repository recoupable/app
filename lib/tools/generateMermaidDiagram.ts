import { generateText, tool } from "ai";
import { z } from "zod";
import { ANTHROPIC_MODEL, MERMAID_INSTRUCTIONS_PROMPT } from "../consts";
import { createModel } from "@/lib/ai/createModel";

export interface GenerateMermaidDiagramResult {
  content: { type: "text"; text: string }[];
  isError: boolean;
}

export const generateMermaidDiagram = tool({
  description:
    "Generate a Mermaid diagram (Flow chart, Sequence diagram, etc.) based on the provided context and sends it directly to the frontend for rendering. Does not return the diagram in the response.",
  inputSchema: z.object({
    context: z
      .string()
      .describe(
        "Detailed description of the desired diagram, including entities, relationships, flow, or structure. " +
          "Specify the type of diagram if known (e.g., flowchart, sequence diagram). " +
          "Example: 'Flowchart for user login: Start -> Enter Credentials -> Validate -> Success/Failure'. " +
          "Example: 'Sequence diagram for API call: User -> Frontend -> API -> Database'"
      ),
  }),
  execute: async ({ context }) => {
    const result = await generateText({
      model: createModel(`anthropic/${ANTHROPIC_MODEL}`),
      system: MERMAID_INSTRUCTIONS_PROMPT,
      prompt: `Generate a Mermaid diagram for the following context: ${context}
            `,
    });

    const extractedMermaid = result.text.match(
      /```mermaid\\n?([\\s\\S]*?)\\n?```/
    );
    const mermaidContent = extractedMermaid
      ? extractedMermaid[0]
      : result.text.trim();

    return {
      content: [{ type: "text", text: mermaidContent }],
      isError: false,
    };
  },
});

export default generateMermaidDiagram;
