import { NextResponse } from "next/server";
import isValidStorageKey from "@/utils/isValidStorageKey";
import { getFileByStorageKey } from "@/lib/supabase/files/getFileByStorageKey";
import { uploadFileByKey } from "@/lib/supabase/storage/uploadFileByKey";
import { updateFileSizeBytes } from "@/lib/supabase/files/updateFileSizeBytes";

/**
 *
 * @param req
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storageKey, content, mimeType, ownerAccountId, artistAccountId } = body;

    // Validate required fields
    if (!storageKey || !isValidStorageKey(storageKey)) {
      return NextResponse.json({ error: "Invalid or missing storage key" }, { status: 400 });
    }

    if (typeof content !== "string") {
      return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
    }

    if (!ownerAccountId || !artistAccountId) {
      return NextResponse.json(
        { error: "Missing ownerAccountId or artistAccountId" },
        { status: 400 },
      );
    }

    // Check if file exists and user has permission
    const fileRecord = await getFileByStorageKey(storageKey);

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Verify ownership
    if (
      fileRecord.owner_account_id !== ownerAccountId ||
      fileRecord.artist_account_id !== artistAccountId
    ) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Convert text content to Blob
    const blob = new Blob([content], { type: mimeType || "text/plain" });
    const file = new File([blob], storageKey.split("/").pop() || "file", {
      type: mimeType || "text/plain",
    });

    // Upload to Supabase storage (upsert overwrites existing file)
    await uploadFileByKey(storageKey, file, {
      contentType: mimeType || "text/plain",
      upsert: true,
    });

    // Update size_bytes in files table
    const sizeBytes = new TextEncoder().encode(content).length;
    try {
      await updateFileSizeBytes(fileRecord.id, sizeBytes);
    } catch (error) {
      console.error("Failed to update file size:", error);
      // Don't fail the request if only metadata update fails
    }

    return NextResponse.json({ success: true, storageKey, sizeBytes }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
