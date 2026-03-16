import { NextResponse } from "next/server";
import supabase from "@/lib/supabase/serverClient";
import { SUPABASE_STORAGE_BUCKET } from "@/lib/consts";

/**
 *
 * @param req
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const storageKey = body.storageKey;
    const storageKeys = body.storageKeys as string[] | undefined;

    // Handle single key request (backward compatibility)
    if (storageKey) {
      let cleanKey = storageKey;
      if (cleanKey.startsWith(`${SUPABASE_STORAGE_BUCKET}/`)) {
        cleanKey = cleanKey.slice(SUPABASE_STORAGE_BUCKET.length + 1);
      }

      const { data, error } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .createSignedUrl(cleanKey, 60 * 60);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ signedUrl: data.signedUrl });
    }

    // Handle batch request
    if (storageKeys && Array.isArray(storageKeys) && storageKeys.length > 0) {
      const cleanKeys = storageKeys.map(key => {
        if (key.startsWith(`${SUPABASE_STORAGE_BUCKET}/`)) {
          return key.slice(SUPABASE_STORAGE_BUCKET.length + 1);
        }
        return key;
      });

      const { data, error } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .createSignedUrls(cleanKeys, 60 * 60);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // data is an array of { error, path, signedUrl }
      // We map it back to a dictionary: { [originalKey]: signedUrl }
      const urlMap: Record<string, string> = {};
      data.forEach((item, index) => {
        if (item.signedUrl) {
          // Map back using the original key from the request
          urlMap[storageKeys[index]] = item.signedUrl;
        }
      });

      return NextResponse.json({ signedUrls: urlMap });
    }

    return NextResponse.json({ error: "Missing storageKey or storageKeys" }, { status: 400 });
  } catch (error) {
    console.error("Server error creating signed URL:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
