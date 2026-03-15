import createCollection from "@/app/api/in_process/createCollection";
import { uploadMetadataJson } from "./arweave/uploadMetadataJson";
import uploadToArweave from "./arweave/uploadToArweave";

export interface GeneratedTxtResponse {
  txt: {
    base64Data: string;
    mimeType: string;
  };
  arweave?: string | null;
  smartAccount: {
    address: string;
    [key: string]: unknown;
  };
  transactionHash: string | null;
}

/**
 *
 * @param contents
 */
export async function generateAndStoreTxtFile(contents: string): Promise<GeneratedTxtResponse> {
  if (!contents) {
    throw new Error("Contents are required");
  }

  // Encode contents to base64
  const base64Data = Buffer.from(contents, "utf-8").toString("base64");
  const mimeType = "text/plain";

  // Upload the TXT file to Arweave
  let txtFile = null;
  try {
    txtFile = await uploadToArweave({
      base64Data,
      mimeType,
    });
  } catch (arweaveError) {
    console.error("Error uploading TXT to Arweave:", arweaveError);
    // Continue and return the TXT even if Arweave upload fails
  }

  const image = "ar://EXwe2peizXKxjUMop6W-JPflC5sWyeQR1y0JiRDwUB0";

  // Upload metadata JSON to Arweave
  let metadataArweave = null;
  try {
    metadataArweave = await uploadMetadataJson({
      image,
      animation_url: txtFile || undefined,
      content: {
        mime: mimeType,
        uri: txtFile || "",
      },
      description: contents,
      name: contents,
    });
  } catch (metadataError) {
    console.error("Error uploading metadata to Arweave:", metadataError);
  }

  // Create a collection on the blockchain using the metadata id
  const result = await createCollection({
    collectionName: contents,
    uri: metadataArweave || "",
  });
  const transactionHash = result.transactionHash || null;

  return {
    txt: {
      base64Data,
      mimeType,
    },
    arweave: txtFile,
    smartAccount: result.smartAccount,
    transactionHash,
  };
}
