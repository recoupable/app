import { generateText as generate } from "ai";
import { DEFAULT_MODEL } from "@/lib/consts";
import { createModel } from "./createModel";

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
    system,
    model: createModel(model || DEFAULT_MODEL),
    prompt,
  });

  return result;
};

export default generateText;
