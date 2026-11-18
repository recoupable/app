import { z } from "zod";
import {
  selectedContextSchema,
  type WorkspaceSelection,
} from "./selectedContextSchema";

const metadataSchema = z.object({
  csrf: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  clientId: z.string(),
  clientName: z.string(),
  clientVerified: z.literal(false),
  accountId: z.string().uuid(),
  context: z.literal("personal"),
  accessDurationDays: z.literal(30).nullable(),
  expiresIn: z.number().positive(),
  permissions: z
    .array(z.object({ scope: z.string(), description: z.string() }))
    .min(1),
});
const selectedMetadataSchema = metadataSchema
  .extend({
    consent_version: z.literal(2),
    csrf: metadataSchema.shape.csrf.optional(),
    selectedContext: selectedContextSchema.optional(),
    workspaces: z.array(
      z.object({
        kind: z.enum(["personal", "organization"]),
        organizationId: z.string().uuid().nullable(),
        name: z.string(),
      }),
    ),
  })
  .refine((value) => !!value.csrf === !!value.selectedContext);
export type ConsentMetadata =
  | z.infer<typeof metadataSchema>
  | z.infer<typeof selectedMetadataSchema>;

/** Only the server-configured issuer receives Privy credentials or controls resumption. */
export function createConsentClient(issuer: string, interaction: string) {
  const base = new URL(issuer);
  if (
    (base.protocol !== "https:" &&
      !(base.protocol === "http:" && base.hostname === "127.0.0.1")) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== "/api/oauth" ||
    base.href !== issuer ||
    !/^[A-Za-z0-9_-]+$/.test(interaction)
  )
    throw new Error("Invalid connection request");
  const endpoint = `${issuer}/interaction/${interaction}`;
  const request = async (
    token: string,
    body?: unknown,
    signal?: AbortSignal,
    query = "",
  ) => {
    const response = await fetch(endpoint + query, {
      method: body ? "POST" : "GET",
      credentials: "include",
      cache: "no-store",
      redirect: "error",
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok)
      throw new Error(
        "This connection request expired or could not be verified. Restart the connection in your agent.",
      );
    return response.json();
  };
  return {
    async load(token: string, signal?: AbortSignal) {
      return metadataSchema.parse(await request(token, undefined, signal));
    },
    async loadSelected(
      token: string,
      selection?: WorkspaceSelection,
      signal?: AbortSignal,
    ) {
      const query = new URLSearchParams({ consent_version: "2", ...selection });
      const result = selectedMetadataSchema.parse(
        await request(token, undefined, signal, `?${query}`),
      );
      if (
        selection &&
        (!result.selectedContext ||
          result.selectedContext.kind !== selection.workspace_kind ||
          (selection.workspace_kind === "organization" &&
            result.selectedContext.organizationId !==
              selection.organization_id) ||
          (selection.workspace_kind === "personal" &&
            result.selectedContext.ownerId !== result.accountId))
      )
        throw new Error("Workspace preview does not match selection");
      return result;
    },
    async decide(
      token: string,
      csrf: string,
      decision: "approve" | "deny",
      selection?: WorkspaceSelection,
    ) {
      const { redirectUrl } = z
        .object({ redirectUrl: z.string().url() })
        .parse(
          await request(token, {
            csrf,
            decision,
            ...(selection ? { consent_version: 2, ...selection } : {}),
          }),
        );
      const resume = new URL(redirectUrl);
      if (
        resume.origin !== base.origin ||
        resume.username ||
        resume.password ||
        resume.hash ||
        !resume.pathname.startsWith(`${base.pathname}/auth/`)
      )
        throw new Error("Invalid connection response");
      return resume.href;
    },
  };
}
