import { GenerateImageResult } from "ai";
import Transaction from "arweave/node/lib/transaction";
import { Address, Hash } from "viem";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface RecoupImageGenerateResponse extends GenerateImageResult {
  imageUrl: string;
  arweaveResult: Transaction;
  moment: {
    contractAddress: Address;
    tokenId: string;
    hash: Hash;
    chainId: number;
  };
}

export interface GeneratedImageResponse {
  imageUrl: string | null;
}

interface FileInput {
  url: string;
  type: string;
}

export async function generateAndProcessImage(
  prompt: string,
  accountId: string,
  files?: FileInput[]
): Promise<GeneratedImageResponse> {
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  if (!accountId) {
    throw new Error("Account ID is required");
  }

  const apiUrl = new URL(`${getClientApiBaseUrl()}/api/image/generate`);
  apiUrl.searchParams.set("prompt", prompt);
  apiUrl.searchParams.set("account_id", accountId);

  // Format files parameter: files=url1:type1|url2:type2
  if (files && files.length > 0) {
    const filesParam = files
      .map((file) => `${file.url}:${file.type}`)
      .join("|");
    apiUrl.searchParams.set("files", filesParam);
  }

  const response = await fetch(apiUrl.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  const data: RecoupImageGenerateResponse = await response.json();

  return {
    imageUrl: data.imageUrl || null,
  };
}
