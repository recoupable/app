type ParsedMcpToolOutput =
  | { kind: "data"; value: object }
  | { kind: "text"; text: string }
  | { kind: "error"; text: string }
  | { kind: "unavailable" };

/** Only structured JSON can enter a specialized result renderer. */
export function parseMcpToolOutput(output: unknown): ParsedMcpToolOutput {
  if (!output || typeof output !== "object") {
    return { kind: "unavailable" };
  }

  const content: unknown[] =
    "content" in output && Array.isArray(output.content) ? output.content : [];
  const blocks = content.filter(
    (block): block is { type: "text"; text: string } =>
      block !== null &&
      typeof block === "object" &&
      "type" in block &&
      block.type === "text" &&
      "text" in block &&
      typeof block.text === "string",
  );
  const text = blocks.map((block) => block.text).join("\n\n");
  if ("isError" in output && output.isError === true) {
    return {
      kind: "error",
      text: text.trim()
        ? text
        : "The tool reported an error without text details.",
    };
  }
  if (!text.trim()) return { kind: "unavailable" };
  if (blocks.length > 1) return { kind: "text", text };

  try {
    const value: unknown = JSON.parse(text);
    if (value !== null && typeof value === "object") {
      return { kind: "data", value };
    }
    if (typeof value === "string" && !value.trim()) {
      return { kind: "unavailable" };
    }
    return { kind: "text", text: typeof value === "string" ? value : text };
  } catch {
    return { kind: "text", text };
  }
}
