import type { SiteAsset } from "./schema";
export function validateSiteAssets(assets: SiteAsset[], ownerId: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return assets.length === 0;
  const prefix = `${base}/storage/v1/object/public/site-assets/${ownerId}/`;
  try {
    return assets.every(
      (asset) =>
        asset.url.startsWith(prefix) &&
        !decodeURIComponent(asset.url).includes(".."),
    );
  } catch {
    return false;
  }
}
