import { z } from "zod";
import { surfaceSchema } from "../schema";
import { identifierSchema, revisionSchema } from "../contractValues";
import { fitsRetainedFieldBudget } from "./fitsRetainedFieldBudget";
import { indexDescriptors } from "../descriptors/indexDescriptors";
import {
  fieldContextSchema,
  retainedFieldRequestSchema,
  type RetainedFieldRequest,
} from "./schemas";
import { projectRetainedField } from "./projectRetainedField";

/** Separate negotiated envelope: never an extension accepted by schema-v1 history. */
export const retainedFieldPartSchema = z
  .object({
    type: z.literal("data-retained-field-snapshot"),
    capability: z.literal("retained-field-companion/1"),
    data: z
      .object({ surface: surfaceSchema, fieldContext: fieldContextSchema })
      .strict(),
  })
  .strict();
const scopeSchema = z
  .object({
    accountId: identifierSchema,
    workspaceId: identifierSchema,
    sessionId: identifierSchema,
    chatId: identifierSchema,
    messageId: identifierSchema,
    generation: revisionSchema,
  })
  .strict();
type Scope = z.infer<typeof scopeSchema>;
type Admission = {
  capability: "retained-field-companion/1";
  /** Supplied by an owning disclosure adapter; this module cannot authorize reads. */
  disclosure: "available" | "unavailable" | "error";
  capturedScope: Scope;
  currentScope: Scope;
  surfaceId: string;
  surfaceRevision: number;
  request: RetainedFieldRequest;
};
/** Offline consumer only. No default capability, network, cached fallback, or live registration. */
export function consumeRetainedField(input: unknown, admission?: Admission) {
  const unavailable = { state: "unavailable" as const };
  if (
    !admission ||
    admission.capability !== "retained-field-companion/1" ||
    admission.disclosure !== "available"
  )
    return unavailable;
  const { capturedScope: captured, currentScope: current } = admission;
  if (
    !scopeSchema.safeParse(captured).success ||
    !scopeSchema.safeParse(current).success ||
    ![
      "accountId",
      "workspaceId",
      "sessionId",
      "chatId",
      "messageId",
      "generation",
    ].every(
      (key) => captured[key as keyof Scope] === current[key as keyof Scope],
    )
  )
    return unavailable;
  try {
    if (!fitsRetainedFieldBudget("part", input)) return unavailable;
    const part = retainedFieldPartSchema.parse(input);
    const request = retainedFieldRequestSchema.parse(admission.request);
    const { surface, fieldContext } = part.data;
    if (
      !fitsRetainedFieldBudget("ready", { state: "ready", ...fieldContext }) ||
      !fitsRetainedFieldBudget("text", surface.fallbackText) ||
      surface.id !== admission.surfaceId ||
      surface.revision !== admission.surfaceRevision ||
      current.workspaceId !== request.workspaceId ||
      JSON.stringify(
        retainedFieldRequestSchema.parse({
          mode: "retained_field",
          workspaceId: fieldContext.workspaceId,
          catalogId: fieldContext.catalogId,
          field: fieldContext.field,
          method: fieldContext.method,
          query: fieldContext.query,
          selections: fieldContext.items.map((item) => item.binding),
        }),
      ) !== JSON.stringify(request)
    )
      return unavailable;
    const projection = projectRetainedField(
      fieldContext,
      surface.id,
      surface.revision,
    );
    if (JSON.stringify(surface) !== JSON.stringify(projection.surface))
      return unavailable;
    return {
      state: "ready" as const,
      fieldContext,
      ...projection,
      descriptors: indexDescriptors(projection.collection.items),
    };
  } catch {
    return unavailable;
  }
}
