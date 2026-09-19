import { getSitesApiUrl } from "./getSitesApiUrl";
import type { SiteSnapshot } from "./schema";
export async function getPublishedSite(id: string) {
  const response = await fetch(
    `${getSitesApiUrl()}/api/sites/public/${encodeURIComponent(id)}`,
    { cache: "no-store", signal: AbortSignal.timeout(15000) },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Site service unavailable");
  const result = (await response.json()) as { snapshot: SiteSnapshot };
  return { published: result.snapshot };
}
