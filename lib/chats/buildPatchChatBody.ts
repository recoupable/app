export type PatchChatBody = {
  title?: string;
  modelId?: string;
};

/**
 * Builds the JSON body for `PATCH /api/sessions/{sessionId}/chats/{chatId}`.
 * At least one field is required (matches api `PatchSessionChatBody`).
 */
export function buildPatchChatBody(fields: PatchChatBody): PatchChatBody {
  const body: PatchChatBody = {};
  if (fields.title !== undefined) {
    body.title = fields.title;
  }
  if (fields.modelId !== undefined) {
    body.modelId = fields.modelId;
  }
  if (Object.keys(body).length === 0) {
    throw new Error("At least one of title or modelId is required");
  }
  return body;
}
