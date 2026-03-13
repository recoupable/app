import { NextResponse } from "next/server";
import supabase from "@/lib/supabase/serverClient";

/**
 *
 * @param req
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      ownerAccountId,
      artistAccountId,
      storageKey,
      fileName,
      mimeType,
      sizeBytes,
      description,
      tags,
    } = body || {};

    if (!ownerAccountId || !artistAccountId || !storageKey || !fileName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("files")
      .insert({
        owner_account_id: ownerAccountId,
        artist_account_id: artistAccountId,
        storage_key: storageKey,
        file_name: fileName,
        mime_type: mimeType ?? null,
        size_bytes: sizeBytes ?? null,
        description: description ?? null,
        tags: Array.isArray(tags) ? tags : [],
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ file: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
