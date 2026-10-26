import { z } from "zod";
import { preparePublicUpload } from "./preparePublicUpload";

const uploadResult = z.object({
  success: z.literal(true),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
  url: z
    .string()
    .url()
    .refine((value) => {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        /^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) &&
        !url.port &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash &&
        url.pathname.startsWith("/storage/v1/object/public/public-uploads/")
      );
    }),
});

/** Authenticated API upload for already-public media; no account override. */
export async function uploadPublicFile({
  file,
  accessToken,
  apiBaseUrl,
  signal,
}: {
  file: File;
  accessToken: string;
  apiBaseUrl: string;
  signal: AbortSignal;
}) {
  if (!accessToken) throw new Error("Please sign in to upload files.");
  const prepared = preparePublicUpload(file);
  const body = new FormData();
  body.set("file", prepared);
  const response = await fetch(`${apiBaseUrl}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
    signal,
  });
  // Proxy/storage errors can be HTML. Never render their raw bodies to users.
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401)
      throw new Error("Please sign in again to upload files.");
    if (response.status === 413)
      throw new Error(
        "This file is too large. Choose a file of 4 MiB or smaller.",
      );
    if (response.status === 415)
      throw new Error(
        "This file type or contents are not supported. Choose a different file.",
      );
    throw new Error("Upload failed. Please try again.");
  }
  const parsed = uploadResult.safeParse(data);
  if (
    !parsed.success ||
    parsed.data.fileSize !== prepared.size ||
    parsed.data.fileType !== prepared.type
  ) {
    throw new Error(
      "The upload returned an invalid response. Please try again.",
    );
  }
  return parsed.data;
}
