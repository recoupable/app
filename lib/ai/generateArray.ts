import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { ANTHROPIC_MODEL, SEGMENT_FAN_SOCIAL_ID_PROMPT } from "../consts";

export interface GenerateArrayResult {
  segmentName: string;
  fans: string[];
}

const generateArray = async ({
  system,
  prompt,
}: {
  system?: string;
  prompt: string;
}): Promise<GenerateArrayResult[]> => {
  const result = await generateObject({
    model: anthropic(ANTHROPIC_MODEL),
    instructions: system,
    prompt,
    output: "array",
    schema: z.object({
      segmentName: z.string().describe("Segment name."),
      fans: z.array(z.string()).describe(SEGMENT_FAN_SOCIAL_ID_PROMPT),
    }),
  });

  return result.object;
};

export default generateArray;
