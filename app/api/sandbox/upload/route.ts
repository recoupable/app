import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

/**
 * POST /api/sandbox/upload
 *
 * Handles client-side Vercel Blob uploads by generating presigned tokens.
 * Auth is validated via clientPayload (the blob client controls its own
 * request headers, so we validate the token passed in the payload).
 * Files are temporarily stored in Vercel Blob, then the client passes
 * the blob URLs to the API which commits them to GitHub and cleans up.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const payload = clientPayload ? JSON.parse(clientPayload) : null;
        if (!payload?.token) {
          throw new Error("Authentication required");
        }

        return {
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
