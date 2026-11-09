/**
 * Lifecycle of the chat workspace (recoup-api session + sandbox) backing
 * the workflow transport:
 * - `off`          — no workspace (provisioning failed / unavailable)
 * - `provisioning` — session + sandbox being created; Send stays gated
 * - `ready`        — workspace live; Send enabled
 */
export type WorkspaceStatus = "off" | "provisioning" | "ready";
