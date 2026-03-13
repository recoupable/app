import { NextResponse } from "next/server";
import isValidStorageKey from "@/utils/isValidStorageKey";
import { createSignedUrlForKey } from "@/lib/supabase/storage/createSignedUrl";
import { getFileByStorageKey } from "@/lib/supabase/files/getFileByStorageKey";
import { checkFileAccess } from "@/lib/files/checkFileAccess";

/**
 *
 * @param req
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || "";
    const accountId = searchParams.get("accountId");
    const expiresParam = searchParams.get("expires");
    const DEFAULT_EXPIRES_SEC = 300; // 5 minutes
    let expires = DEFAULT_EXPIRES_SEC;

    // Validate expires parameter
    if (expiresParam !== null && expiresParam !== "") {
      const parsed = Number(expiresParam);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return NextResponse.json({ error: "Invalid expires value" }, { status: 400 });
      }
      expires = parsed;
    }

    // Validate storage key format
    if (!isValidStorageKey(key)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    // Validate user authentication
    if (!accountId) {
      return NextResponse.json({ error: "Missing accountId" }, { status: 401 });
    }

    // Get file metadata to check permissions
    const file = await getFileByStorageKey(key);
    if (!file) {
      return NextResponse.json(
        {
          error: "File not found in database",
          details: `No file record found with storage key: ${key}`,
          key,
        },
        { status: 404 },
      );
    }

    // Check if user has access to this file
    const hasAccess = await checkFileAccess(accountId, file);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Generate signed URL only after permission check passes
    const signedUrl = await createSignedUrlForKey(key, expires);
    return NextResponse.json({ signedUrl }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
