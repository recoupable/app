import uploadToArweave from "./uploadToArweave";

/**
 * Uploads an image from a remote URL to Arweave and returns the Arweave URL.
 * Falls back to the original URL if upload fails.
 *
 * @param imageUrl - The remote image URL
 * @returns The Arweave URL or the original URL if upload fails
 */
export default async function uploadLinkToArweave(imageUrl: string): Promise<string | null> {
  try {
    const imgRes = await fetch(imageUrl);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
    const imgBase64 = imgBuffer.toString("base64");
    const mimeType = imgRes.headers.get("content-type") || "image/png";

    const arweaveResult = await uploadToArweave({
      base64Data: imgBase64,
      mimeType,
    });
    return arweaveResult;
  } catch (err) {
    console.error("Failed to upload image to Arweave, using original:", err);
    return null;
  }
}
