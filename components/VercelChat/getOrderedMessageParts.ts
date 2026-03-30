import { UIDataTypes, UIMessagePart, UITools } from "ai";
import { isDeferredSandboxResultPart } from "./isDeferredSandboxResultPart";

export function getOrderedMessageParts(
  parts: UIMessagePart<UIDataTypes, UITools>[],
) {
  const regularParts: UIMessagePart<UIDataTypes, UITools>[] = [];
  const deferredSandboxParts: UIMessagePart<UIDataTypes, UITools>[] = [];

  for (const part of parts) {
    if (isDeferredSandboxResultPart(part)) {
      deferredSandboxParts.push(part);
      continue;
    }

    regularParts.push(part);
  }

  return [...regularParts, ...deferredSandboxParts];
}
