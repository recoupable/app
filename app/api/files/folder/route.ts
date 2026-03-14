import { NextResponse } from "next/server";
import supabase from "@/lib/supabase/serverClient";
import isValidFolderName from "@/utils/isValidFolderName";

/**
 *
 * @param req
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ownerAccountId = String(body.ownerAccountId || "");
    const artistAccountId = String(body.artistAccountId || "");
    const parentPath = String(body.parentPath || "");
    const name = String(body.name || "");

    if (!ownerAccountId || !artistAccountId) {
      return NextResponse.json(
        { error: "Missing ownerAccountId or artistAccountId" },
        { status: 400 },
      );
    }
    if (!isValidFolderName(name)) {
      return NextResponse.json({ error: "Invalid folder name" }, { status: 400 });
    }

    const base =
      parentPath && parentPath.endsWith("/")
        ? parentPath
        : parentPath
          ? parentPath + "/"
          : `files/${ownerAccountId}/${artistAccountId}/`;
    const key = `${base}${name}/`;

    // conflict check
    const { data: exists, error: existsError } = await supabase
      .from("files")
      .select("id")
      .eq("storage_key", key)
      .limit(1)
      .maybeSingle();
    if (existsError) {
      return NextResponse.json({ error: existsError.message }, { status: 500 });
    }
    if (exists) {
      return NextResponse.json({ error: "Folder already exists" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("files")
      .insert({
        owner_account_id: ownerAccountId,
        artist_account_id: artistAccountId,
        storage_key: key,
        file_name: name,
        is_directory: true,
        mime_type: null,
        size_bytes: null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ folder: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
