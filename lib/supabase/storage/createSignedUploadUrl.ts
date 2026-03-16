import supabase from "@/lib/supabase/serverClient";
import { SUPABASE_STORAGE_BUCKET } from "@/lib/consts";

export type SignedUploadResult = {
  signedUrl: string;
  path: string;
};

/**
 *
 * @param key
 */
export async function createSignedUploadUrlForKey(key: string): Promise<SignedUploadResult> {
  const { data, error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .createSignedUploadUrl(key);

  if (error || !data?.signedUrl || !data?.path) {
    throw new Error(error?.message || "Failed to create signed upload URL");
  }

  return { signedUrl: data.signedUrl, path: data.path };
}
