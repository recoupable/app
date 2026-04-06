import type { Knowledge } from "@/types/Knowledge";

export function normalizeKnowledges(value: unknown): Knowledge[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is Knowledge => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const knowledge = item as Partial<Knowledge>;
    return (
      typeof knowledge.name === "string" &&
      typeof knowledge.url === "string" &&
      typeof knowledge.type === "string"
    );
  });
}
