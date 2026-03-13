import uploadToArweave from "./uploadToArweave";

interface CreateMetadataArgs {
  name: string;
  image?: string;
  animation_url?: string;
  description?: string;
  external_url?: string;
  content?: {
    mime: string;
    uri: string;
  };
}

/**
 * Uploads a metadata JSON object to Arweave as a base64-encoded file.
 *
 * @param args - The metadata creation arguments
 * @param metadata
 * @returns The result from uploadToArweave
 */
export async function uploadMetadataJson(metadata: CreateMetadataArgs) {
  const metadataBase64 = Buffer.from(JSON.stringify(metadata)).toString("base64");
  const metadataResult = await uploadToArweave({
    base64Data: metadataBase64,
    mimeType: "application/json",
  });
  return metadataResult;
}
