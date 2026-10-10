import { z } from "zod";
import { getSitesApiUrl } from "@/lib/sites/getSitesApiUrl";
const dsp = z
  .string()
  .url()
  .refine((value) => new URL(value).protocol === "https:");
const configSchema = z.object({
  playerId: z.string().uuid(),
  name: z.string().max(120),
  artwork: dsp.nullable().optional(),
  spotifyUrl: dsp.nullable(),
  appleUrl: dsp.nullable(),
  revision: z.number().int().positive(),
  sessionId: z.string().uuid().optional(),
  flow: z.string().max(2048).optional(),
  release: dsp.optional(),
  provider: z.enum(["spotify", "apple_music"]).optional(),
  spotify: z
    .object({
      configured: z.boolean(),
      clientId: z.string().nullable(),
      redirectUri: z.string().url(),
      scopes: z.array(z.string()),
    })
    .optional(),
});
export type PlayerConfig = z.infer<typeof configSchema>;
/** The external site selects an ID; the API selects destinations, permissions and ownership. */
export async function getPlayerConfig(id: string, query: URLSearchParams) {
  z.string().uuid().parse(id);
  const url = new URL(`${getSitesApiUrl()}/api/players/public/${id}`);
  for (const key of [
    "provider",
    "parent",
    "flow",
    "source",
    "medium",
    "campaign",
    "content",
  ]) {
    const value = query.get(key);
    if (value) url.searchParams.set(key, value);
  }
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Player unavailable");
  const config = configSchema.parse(await response.json());
  if (config.playerId !== id) throw new Error("Player mismatch");
  return config;
}
