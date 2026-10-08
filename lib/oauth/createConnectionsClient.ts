import { z } from "zod";
import { createConsentClient } from "./createConsentClient";
const listSchema = z.object({
  connections: z
    .array(
      z.object({
        id: z.string().regex(/^[a-f0-9]{64}$/),
        clientId: z.string(),
        clientName: z.string(),
        scopes: z.array(z.string()),
        createdAt: z.number(),
        expiresAt: z.number().nullable(),
      }),
    )
    .max(200),
  truncated: z.boolean(),
});
export type Connections = z.infer<typeof listSchema>;
/** Credentials go only to the configured issuer, with redirects and cookie authentication disabled. */
export function createConnectionsClient(issuer: string) {
  createConsentClient(issuer, "configuration-check");
  const request = async (token: string, id?: string, signal?: AbortSignal) => {
    if (id !== undefined && !/^[a-f0-9]{64}$/.test(id))
      throw new Error("Invalid connection.");
    const response = await fetch(`${issuer}/connections${id ? `/${id}` : ""}`, {
      method: id ? "DELETE" : "GET",
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      signal,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok)
      throw new Error(
        id
          ? "Unable to revoke connection. Try again."
          : "Unable to load connections. Sign in again or retry.",
      );
    return response;
  };
  return {
    async load(token: string, signal?: AbortSignal) {
      return listSchema.parse(
        await (await request(token, undefined, signal)).json(),
      );
    },
    async revoke(token: string, id: string) {
      await request(token, id);
    },
  };
}
