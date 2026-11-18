import { validateUIMessages, type UIMessage, type UIMessageChunk } from "ai";

const invalid = () => new Error("Invalid stream continuation envelope");
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null &&
  typeof value === "object" &&
  Object.getPrototypeOf(value) === Object.prototype;
const keys = (value: Record<string, unknown>, allowed: string[]) =>
  Object.keys(value).every((key) => allowed.includes(key));

/** Decode control data, never history authority. No provider payload is fetched. */
export async function decodeContinuationStart(chunk: UIMessageChunk): Promise<{
  chunk: UIMessageChunk;
  base?: UIMessage;
}> {
  if (chunk.type !== "start") {
    if (
      chunk.type === "message-metadata" &&
      object(chunk.messageMetadata) &&
      Object.hasOwn(chunk.messageMetadata, "recoupStream")
    )
      throw invalid();
    return { chunk };
  }
  const metadata = chunk.messageMetadata;
  if (!object(metadata) || !Object.hasOwn(metadata, "recoupStream"))
    return { chunk };
  const marker = metadata.recoupStream;
  // Bound traversal before stringify/schema validation. Accessors, cycles,
  // exotic objects and sparse arrays are not a wire JSON representation.
  let values = 0;
  let stringUnits = 0;
  const seen = new Set<object>();
  const visit = (value: unknown, depth: number) => {
    if (++values > 50_000 || depth > 32) throw invalid();
    if (value === null || typeof value === "boolean") return;
    if (typeof value === "string") {
      stringUnits += value.length;
      if (stringUnits > 1_048_576) throw invalid();
      return;
    }
    if (typeof value === "number" && Number.isFinite(value)) return;
    if (!Array.isArray(value) && !object(value)) throw invalid();
    if (seen.has(value)) throw invalid();
    seen.add(value);
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Array.isArray(value) && Object.keys(value).length !== value.length)
      throw invalid();
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (Array.isArray(value) && key === "length") continue;
      if (!descriptor.enumerable || !("value" in descriptor)) throw invalid();
      if (!Array.isArray(value)) stringUnits += key.length;
      if (stringUnits > 1_048_576) throw invalid();
      if (key === "recoupStream") throw invalid();
      visit(descriptor.value, depth + 1);
    }
    seen.delete(value);
  };
  visit(marker, 0);
  if (new TextEncoder().encode(JSON.stringify(marker)).byteLength > 1_048_576)
    throw invalid();
  if (
    !object(marker) ||
    !keys(marker, ["version", "mode", "base"]) ||
    marker.version !== 1 ||
    marker.mode !== "continuation" ||
    !object(marker.base)
  )
    throw invalid();
  const base = marker.base;
  if (
    !keys(base, ["id", "role", "parts", "metadata"]) ||
    typeof base.id !== "string" ||
    !base.id.length ||
    base.id.length > 256 ||
    base.id !== chunk.messageId ||
    base.role !== "assistant" ||
    !Array.isArray(base.parts) ||
    base.parts.length > 2048 ||
    base.parts.some(
      (part) =>
        !object(part) ||
        part.type === "custom" ||
        part.type === "reasoning-file",
    )
  )
    throw invalid();
  try {
    await validateUIMessages({ messages: [base] });
  } catch {
    throw invalid();
  }
  const remaining = { ...metadata };
  delete remaining.recoupStream;
  const start = { ...chunk };
  delete start.messageMetadata;
  return {
    chunk: Object.keys(remaining).length
      ? { ...start, messageMetadata: remaining }
      : start,
    // Keep original canonical observation payloads; schema parsing is not a
    // projection sanitizer and must not strip their original/proof fields.
    base: structuredClone(base) as unknown as UIMessage,
  };
}
