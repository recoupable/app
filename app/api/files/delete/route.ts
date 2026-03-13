import { NextResponse } from "next/server";
import { checkFileAccess } from "@/lib/files/checkFileAccess";
import { getFileById } from "@/lib/supabase/files/getFileById";
import { getFilesInDirectory } from "@/lib/supabase/files/getFilesInDirectory";
import { deleteFilesInDirectory } from "@/lib/supabase/files/deleteFilesInDirectory";
import { deleteFileRecord } from "@/lib/supabase/files/deleteFileRecord";
import { deleteFileByKey } from "@/lib/supabase/storage/deleteFileByKey";

/**
 *
 * @param req
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = String(body.id || "");
    const storageKey = String(body.storageKey || "");
    const ownerAccountId = String(body.ownerAccountId || "");

    // Validate required fields
    if (!id || !storageKey || !ownerAccountId) {
      return NextResponse.json(
        { error: "Missing id, storageKey or ownerAccountId" },
        { status: 400 },
      );
    }

    // Fetch file metadata for permission check
    const file = await getFileById(id);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Verify user has access to this file
    const hasAccess = await checkFileAccess(ownerAccountId, file);
    if (!hasAccess) {
      return NextResponse.json({ error: "You don't have access to this file" }, { status: 403 });
    }

    // Handle directory deletion (recursive)
    if (file.is_directory) {
      // Get all child files in the directory
      const childFiles = await getFilesInDirectory(storageKey, id);

      // Delete child files from storage bucket
      if (childFiles.length > 0) {
        const childStorageKeys = childFiles.map(f => f.storage_key);
        await deleteFileByKey(childStorageKeys);
      }

      // Delete child file records from database
      await deleteFilesInDirectory(storageKey, id);
    } else {
      // Delete single file from storage bucket
      await deleteFileByKey(storageKey);
    }

    // Delete the file/directory record from database
    await deleteFileRecord(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
