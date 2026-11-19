import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import sourcePin from "./fixtures/source-pin.json";
import { consumeRetainedField } from "../consumeRetainedField";
import { projectRetainedField } from "../projectRetainedField";
import { fieldContextSchema, retainedFieldRequestSchema } from "../schemas";
import { objectRefKey } from "../../descriptors/objectRefKey";

it("consumes pinned API-generated synthetic field context without adapting its identities or amounts", () => {
  const bytes = readFileSync(
    new URL("./fixtures/api-fieldContext.json", import.meta.url),
  );
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(
    sourcePin.sha256,
  );
  const context = fieldContextSchema.parse(JSON.parse(bytes.toString("utf8")));
  const request = retainedFieldRequestSchema.parse({
    mode: "retained_field",
    workspaceId: context.workspaceId,
    catalogId: context.catalogId,
    field: context.field,
    method: context.method,
    query: context.query,
    selections: context.items.map((item) => item.binding),
  });
  // This synthetic expected selection is NOT a receipt-origin or authority test.
  const scope = {
    accountId: "synthetic-actor",
    workspaceId: context.workspaceId,
    sessionId: "synthetic-session",
    chatId: "synthetic-chat",
    messageId: "synthetic-message",
    generation: 1,
  };
  const part = {
    type: "data-retained-field-snapshot",
    capability: "retained-field-companion/1",
    data: {
      fieldContext: context,
      surface: projectRetainedField(context, "api-fixture", 3).surface,
    },
  };
  expect(consumeRetainedField(part)).toEqual({ state: "unavailable" });
  const admission = {
    capability: "retained-field-companion/1" as const,
    disclosure: "available" as const,
    capturedScope: scope,
    currentScope: scope,
    surfaceId: "api-fixture",
    surfaceRevision: 3,
    request,
  };
  const result = consumeRetainedField(part, admission);
  expect(result.state).toBe("ready");
  if (result.state !== "ready")
    throw new Error("Expected synthetic compatible payload");
  expect(result.fieldContext).toEqual(context);
  expect(
    result.descriptors.get(objectRefKey(context.items[0].ref))?.field.value,
  ).toEqual({ state: "known", amount: 100 });
  expect(result.text).toContain("100 streams");
  expect(result.fieldContext.items[0].binding.revision).toBe(7);
  expect(result.surface.revision).toBe(3);
  expect(
    consumeRetainedField(part, { ...admission, disclosure: "unavailable" }),
  ).toEqual({ state: "unavailable" });
  expect(
    consumeRetainedField(part, {
      ...admission,
      request: {
        ...request,
        selections: [{ ...request.selections[0], revision: 8 }],
      },
    }),
  ).toEqual({ state: "unavailable" });
});
