import { FanData, JsonObject } from "./messageParser";

export interface MessageSegment {
  type: "text" | "fans";
  content: string | FanData;
}

/**
 * Splits a message into segments of text and fan data
 *
 * @param content
 * @param jsonObjects
 */
export const createMessageSegments = (
  content: string,
  jsonObjects: JsonObject[],
): MessageSegment[] => {
  if (jsonObjects.length === 0) {
    return [{ type: "text", content }];
  }

  const segments: MessageSegment[] = [];
  let lastEnd = 0;

  jsonObjects.forEach(obj => {
    // Add text before the JSON if any
    if (obj.start > lastEnd) {
      const textContent = content.slice(lastEnd, obj.start).trim();
      if (textContent) {
        segments.push({ type: "text", content: textContent });
      }
    }

    // Add the fan data
    segments.push({ type: "fans", content: obj.json });
    lastEnd = obj.end;
  });

  // Add remaining text if any
  if (lastEnd < content.length) {
    const textContent = content.slice(lastEnd).trim();
    if (textContent) {
      segments.push({ type: "text", content: textContent });
    }
  }

  return segments;
};
