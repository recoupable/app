import { generateText as generate } from "ai";
import { DEFAULT_MODEL } from "@/lib/consts";

const generateText = async ({
  system,
  prompt,
  model,
}: {
  system?: string;
  prompt: string;
  model?: string;
}) => {
  const result = await generate({
    instructions: system,
    model: model || DEFAULT_MODEL,
    prompt,
  });

  return result;
};

export default generateText;
