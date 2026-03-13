import { DEFAULT_MODEL, PROMPT_SUGGESTIONS_SYSTEM_PROMPT } from "@/lib/consts";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const POST = async (req: NextRequest) => {
  const { content } = await req.json();

  const { object } = await generateObject({
    model: DEFAULT_MODEL,
    system: PROMPT_SUGGESTIONS_SYSTEM_PROMPT,
    schema: z.object({
      suggestions: z.array(
        z.object({
          text: z.string(),
          type: z
            .enum(["youtube", "tiktok", "instagram", "spotify", "other"])
            .describe(
              "The type of suggestion. This will be used to determine the type of suggestion to display.",
            ),
        }),
      ),
    }),
    prompt: `Generate 4 suggestions for the following prompt: ${content}`,
  });

  return NextResponse.json(object);
};
