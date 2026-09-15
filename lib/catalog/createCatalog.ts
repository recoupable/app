import { z } from "zod";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const catalogResponse = z.object({
  catalog: z.object({ id: z.string().uuid() }),
});

export async function createCatalog(
  name: string,
  accessToken: string,
  organizationId: string | null,
): Promise<string> {
  const response = await fetch(`${getClientApiBaseUrl()}/api/catalogs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: name.trim(),
      ...(organizationId ? { organization_id: organizationId } : {}),
    }),
  });
  const data = await response.json();
  if (!response.ok || data.status === "error")
    throw new Error(data.error || "Could not add catalog. Please try again.");
  return catalogResponse.parse(data).catalog.id;
}
