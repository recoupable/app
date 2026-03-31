import { UIDataTypes, UIMessagePart, UITools } from "ai";
import { isDeferredSandboxResultPart } from "./isDeferredSandboxResultPart";

export interface OrderedMessagePart {
  originalIndex: number;
  part: UIMessagePart<UIDataTypes, UITools>;
}

export function getOrderedMessageParts(
  parts: UIMessagePart<UIDataTypes, UITools>[],
): OrderedMessagePart[] {
  const regularParts: OrderedMessagePart[] = [];
  const deferredSandboxParts: OrderedMessagePart[] = [];

  for (const [originalIndex, part] of parts.entries()) {
    const orderedPart = { originalIndex, part };

    if (isDeferredSandboxResultPart(part)) {
      deferredSandboxParts.push(orderedPart);
      continue;
    }

    regularParts.push(orderedPart);
  }

  return [...regularParts, ...deferredSandboxParts];
}
