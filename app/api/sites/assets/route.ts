import { NextResponse } from "next/server";
import { z } from "zod";
import sharp from "sharp";
import { authorizeSites } from "@/lib/sites/authorizeSites";
import { uploadSiteAsset } from "@/lib/supabase/storage/uploadSiteAsset";
export const runtime = "nodejs";
/** Upload public site artwork/audio after authenticating workspace ownership. */
export async function POST(request: Request) {
  const organizationId = new URL(request.url).searchParams.get(
    "organizationId",
  );
  if (organizationId && !z.string().uuid().safeParse(organizationId).success)
    return NextResponse.json({ error: "Invalid workspace" }, { status: 400 });
  try {
    const auth = await authorizeSites(request, organizationId);
    if (auth instanceof NextResponse) return auth;
    const data = await request.formData();
    const file = data.get("file");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > 4 * 1024 * 1024
    )
      return NextResponse.json(
        { error: "Choose an image or audio file under 4 MB" },
        { status: 400 },
      );
    let bytes: Buffer = Buffer.from(await file.arrayBuffer());
    let type: "image" | "audio", contentType: string, extension: string;
    if (["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      bytes = await sharp(bytes, { limitInputPixels: 40000000 })
        .rotate()
        .resize({
          width: 2400,
          height: 2400,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 88 })
        .toBuffer();
      type = "image";
      contentType = "image/webp";
      extension = "webp";
    } else if (
      (file.type === "audio/mpeg" &&
        (bytes.subarray(0, 3).toString() === "ID3" ||
          (bytes[0] === 255 && (bytes[1] & 224) === 224))) ||
      (["audio/wav", "audio/x-wav"].includes(file.type) &&
        bytes.subarray(0, 4).toString() === "RIFF" &&
        bytes.subarray(8, 12).toString() === "WAVE")
    ) {
      type = "audio";
      extension = file.type === "audio/mpeg" ? "mp3" : "wav";
      contentType = extension === "mp3" ? "audio/mpeg" : "audio/wav";
    } else
      return NextResponse.json(
        { error: "Use JPG, PNG, WebP, MP3, or WAV" },
        { status: 400 },
      );
    const url = await uploadSiteAsset(
      auth.ownerId,
      bytes,
      contentType,
      extension,
    );
    return NextResponse.json({
      asset: { url, type, name: file.name.slice(0, 200) },
    });
  } catch {
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 503 },
    );
  }
}
