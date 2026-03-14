import sharp from "sharp";

/**
 *
 * @param thumbnail_url
 */
export async function getResizedImageBuffer(
  thumbnail_url: string,
): Promise<{ buffer?: Buffer; error?: string }> {
  try {
    const res = await fetch(thumbnail_url);
    if (!res.ok) {
      return {
        error: `Failed to fetch thumbnail from URL: ${res.status} ${res.statusText}`,
      };
    }
    const arrayBuffer = await res.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    let buffer = Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength) as Buffer;
    const MAX_SIZE = 2_097_152; // 2MB in bytes

    // If image is too large, resize and compress
    if (buffer.length > MAX_SIZE) {
      buffer = await sharp(buffer)
        .resize({ width: 1280, height: 720, fit: "inside" })
        .jpeg({ quality: 80 })
        .toBuffer();
    }

    // Check again after resizing/compression
    if (buffer.length > MAX_SIZE) {
      return {
        error: `Thumbnail image is too large even after resizing/compression (${buffer.length} bytes). Please provide a smaller image.`,
      };
    }

    return { buffer };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to process image.",
    };
  }
}
