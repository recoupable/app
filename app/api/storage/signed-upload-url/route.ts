import { NextResponse } from "next/server";
import { createSignedUploadUrlForKey } from "@/lib/supabase/storage/createSignedUploadUrl";
import isValidStorageKey from "@/utils/isValidStorageKey";

/**
 *
 * @param req
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = String(body.key || "");
    if (!key || !isValidStorageKey(key))
      return NextResponse.json({ error: "Invalid or missing key" }, { status: 400 });

    const result = await createSignedUploadUrlForKey(key);
    return NextResponse.json({ signedUrl: result.signedUrl, path: result.path }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
