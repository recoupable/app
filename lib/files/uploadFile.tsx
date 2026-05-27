import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export type UploadFileResponse = {
  id: string;
  uri: string;
};

export const uploadFile = async (
  file: File,
  accessToken: string | null,
): Promise<UploadFileResponse> => {
  if (!accessToken) throw new Error("Not authenticated");

  try {
    const data = new FormData();
    data.set("file", file);

    const res = await fetch(`${getClientApiBaseUrl()}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: data,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      throw new Error(json?.error || "Upload failed");
    }

    return {
      id: json.id,
      uri: json.url,
    };
  } catch (error) {
    console.error("File upload failed:", error);
    throw error;
  }
};
