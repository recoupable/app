import { API_PUBLIC_BASE_URL } from "@/lib/consts";
/** Server-only override supports an API preview or local API without changing other features. */
export function getSitesApiUrl() {
  return (process.env.SITES_API_URL || API_PUBLIC_BASE_URL).replace(/\/$/, "");
}
