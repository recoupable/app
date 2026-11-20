import { z } from "zod";

export const selectedContextSchema = z
  .object({
    version: z.literal(1),
    capabilityVersion: z.literal("context-workspace-v1"),
    mode: z.literal("selected_context"),
    kind: z.enum(["personal", "organization"]),
    ownerId: z.string().uuid(),
    organizationId: z.string().uuid().nullable(),
  })
  .strict()
  .refine((value) =>
    value.kind === "personal"
      ? value.organizationId === null
      : value.ownerId === value.organizationId,
  );

export type WorkspaceSelection =
  | { workspace_kind: "personal" }
  | { workspace_kind: "organization"; organization_id: string };
