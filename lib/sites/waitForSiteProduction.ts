import type { Site } from "./schema";
type Result = {
  site?: Site;
  generation?: { token?: string; status: string };
  error?: string;
};
type Request = <T>(path: string, init?: RequestInit) => Promise<T>;
/** Resume a durable job after a refresh; polling never starts additional paid work. */
export async function waitForSiteProduction(
  request: Request,
  siteId: string,
  result: Result,
  onStatus?: (message: string) => void,
  signal?: AbortSignal,
): Promise<{ site: Site }> {
  if (result.site && !result.generation) return { site: result.site };
  const key = `site-production:${siteId}`;
  const token = result.generation?.token || sessionStorage.getItem(key);
  if (!token) throw new Error("Generation could not be started.");
  sessionStorage.setItem(key, token);
  onStatus?.(
    "Creating your experience. You can leave this page; production will continue.",
  );
  while (true) {
    if (signal?.aborted) throw new Error("Stopped observing generation");
    const status = await request<Result>(`/api/sites/${siteId}`, {
      method: "PATCH",
      signal,
      body: JSON.stringify({ action: "generation", token }),
    });
    if (status.generation?.status === "failed") {
      sessionStorage.removeItem(key);
      throw new Error(
        status.error || "Generation stopped. Your saved draft is unchanged.",
      );
    }
    if (status.generation?.status === "completed" && status.site) {
      sessionStorage.removeItem(key);
      return { site: status.site };
    }
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
}
