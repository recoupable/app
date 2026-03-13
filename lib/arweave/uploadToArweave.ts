import Arweave from "arweave";
import type { JWKInterface } from "arweave/node/lib/wallet";

const rawArweaveKey = process.env.ARWEAVE_KEY;

if (!rawArweaveKey) {
  throw new Error(
    "ARWEAVE_KEY environment variable is missing. Please set it to a base64-encoded JSON key.",
  );
}

const ARWEAVE_KEY: JWKInterface = (() => {
  try {
    const decodedKey = Buffer.from(rawArweaveKey, "base64").toString();
    return JSON.parse(decodedKey) as JWKInterface;
  } catch (error) {
    throw new Error(
      `Failed to decode ARWEAVE_KEY. Ensure it is base64-encoded JSON. ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
})();

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 20000,
  logging: false,
});

const uploadToArweave = async (
  imageData: { base64Data: string; mimeType: string },
  getProgress: (progress: number) => void = () => {},
): Promise<string> => {
  const buffer = Buffer.from(imageData.base64Data, "base64");

  const transaction = await arweave.createTransaction(
    {
      data: buffer,
    },
    ARWEAVE_KEY,
  );
  transaction.addTag("Content-Type", imageData.mimeType);
  await arweave.transactions.sign(transaction, ARWEAVE_KEY);
  const uploader = await arweave.transactions.getUploader(transaction);

  while (!uploader.isComplete) {
    console.log(
      `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`,
    );
    getProgress(uploader.pctComplete);
    await uploader.uploadChunk();
  }

  return `ar://${transaction.id}`;
};

export default uploadToArweave;
