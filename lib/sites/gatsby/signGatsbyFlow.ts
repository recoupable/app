import { createHmac } from "node:crypto";
/** Signed, short-lived audience context; contains no fan identity or provider token. */
export function signGatsbyFlow(origin: string, release: string) {
  const key =
    process.env.SITES_GATSBY_FLOW_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Fan connection configuration unavailable");
  const payload = Buffer.from(
    JSON.stringify({
      audience: "GatsbyWebsite1",
      origin,
      release,
      expires: Date.now() + 600000,
    }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", key).update(`gatsby-flow:v1:${payload}`).digest("base64url")}`;
}
