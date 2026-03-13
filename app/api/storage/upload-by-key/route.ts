import { NextResponse } from "next/server";
import { isValidStorageKey } from "@/utils/isValidStorageKey";
import { uploadFileByKey } from "@/lib/supabase/storage/uploadFileByKey";

/**
 *
 * @param req
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const key = formData.get("key");
    const file = formData.get("file");

    if (typeof key !== "string" || !isValidStorageKey(key)) {
      return NextResponse.json({ error: "Invalid or missing key" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    await uploadFileByKey(key, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    return NextResponse.json({ path: key }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
