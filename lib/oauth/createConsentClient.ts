import { z } from "zod";

const metadataSchema = z.object({
  csrf: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  clientId: z.string(),
  clientName: z.string(),
  clientVerified: z.literal(false),
  accountId: z.string().uuid(),
  context: z.literal("personal"),
  accessDurationDays: z.literal(30),
  expiresIn: z.number().positive(),
  permissions: z
    .array(z.object({ scope: z.string(), description: z.string() }))
    .min(1),
});
export type ConsentMetadata = z.infer<typeof metadataSchema>;

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
  ) => {
    const response = await fetch(endpoint, {
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
    async decide(token: string, csrf: string, decision: "approve" | "deny") {
      const { redirectUrl } = z
        .object({ redirectUrl: z.string().url() })
        .parse(await request(token, { csrf, decision }));
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
