/**
 * API call to update file content
 */
export type UpdateFileParams = {
  storageKey: string;
  content: string;
  mimeType: string;
  ownerAccountId: string;
  artistAccountId: string;
};

export type UpdateFileResponse = {
  success: boolean;
  storageKey: string;
  sizeBytes: number;
};

/**
 *
 * @param params
 */
export async function updateFileContent(params: UpdateFileParams): Promise<UpdateFileResponse> {
  const response = await fetch("/api/files/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update file");
  }

  return response.json();
}
