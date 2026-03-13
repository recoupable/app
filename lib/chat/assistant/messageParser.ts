import { Database } from "@/types/database.types";

type Social = Database["public"]["Tables"]["socials"]["Row"];

export interface FanData {
  fans: Social[];
}

export interface JsonObject {
  json: FanData;
  start: number;
  end: number;
}

/**
 * Finds and validates JSON objects containing fan data within a text string
 *
 * @param text
 */
export const findJsonObjects = (text: string): JsonObject[] => {
  const results: JsonObject[] = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") {
      if (depth === 0) {
        start = i;
      }
      depth++;
    } else if (text[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          const jsonStr = text.slice(start, i + 1);
          const parsed = JSON.parse(jsonStr);
          if (parsed && Array.isArray(parsed.fans)) {
            results.push({
              json: parsed,
              start,
              end: i + 1,
            });
          }
        } catch {
          // Invalid JSON or not fan data, ignore
        }
      }
    }
  }
  return results;
};
