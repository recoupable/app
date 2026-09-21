import { getSitesApiUrl } from "./getSitesApiUrl";
export async function submitSiteSignup(siteId: string, email: string) {
  const response = await fetch(
    `${getSitesApiUrl()}/api/sites/public/${encodeURIComponent(siteId)}/signup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, consent: "yes" }),
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) throw new Error("Could not save signup");
}
