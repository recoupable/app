import supabase from "@/lib/supabase/serverClient";
import { SUPABASE_STORAGE_BUCKET } from "@/lib/consts";

/**
 *
 * @param key
 * @param expiresInSec
 */
export async function createSignedUrlForKey(
  key: string,
  expiresInSec: number = 300,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .createSignedUrl(key, expiresInSec);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Failed to create signed URL");
  }

  return data.signedUrl;
}
