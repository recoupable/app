import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
/** Validate the server-issued audience before accepting an OAuth authorization code. */
export function verifyGatsbyFlow(value: string, origin: string) {
  const key =
    process.env.SITES_GATSBY_FLOW_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  const [payload, signature, extra] = value.split(".");
  if (!key || !payload || !signature || extra) throw new Error("Invalid flow");
  const actual = Buffer.from(signature, "base64url");
  const expected = createHmac("sha256", key)
    .update(`gatsby-flow:v1:${payload}`)
    .digest();
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    throw new Error("Invalid flow");
  const context = z
    .object({
      audience: z.literal("GatsbyWebsite1"),
      origin: z.string(),
      release: z.enum([
        "https://open.spotify.com/playlist/5b8JKnvweOEaLqS00nIr7n",
        "https://open.spotify.com/track/4HJjUdcezdSSCBdy5JVHDs",
      ]),
      expires: z.number(),
    })
    .parse(JSON.parse(Buffer.from(payload, "base64url").toString()));
  if (
    context.origin !== origin ||
    context.expires < Date.now() ||
    context.expires > Date.now() + 600000
  )
    throw new Error("Expired flow");
  return context;
}
