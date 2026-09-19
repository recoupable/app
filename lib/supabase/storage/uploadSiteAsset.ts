import supabase from "@/lib/supabase/serverClient";
export async function uploadSiteAsset(
  ownerId: string,
  bytes: Buffer,
  contentType: string,
  extension: string,
) {
  const path = `${ownerId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("site-assets")
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error("Could not upload asset");
  return supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
}
