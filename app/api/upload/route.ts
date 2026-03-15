import { NextResponse } from "next/server";
import uploadToArweave from "@/lib/arweave/uploadToArweave";
import { getFetchableUrl } from "@/lib/arweave/gateway";

/**
 *
 * @param request
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No file provided");
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileSize = fileBuffer.length;

    const arweaveUrl = await uploadToArweave({
      base64Data: fileBuffer.toString("base64"),
      mimeType: file.type || "application/octet-stream",
    });

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType: file.type,
      fileSize,
      url: getFetchableUrl(arweaveUrl),
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
