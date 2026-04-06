import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

type KnowledgeItem = {
  name: string;
  url: string;
  type: string;
};

type UpdateAccountProfileArgs = {
  accountId: string;
  accessToken: string;
  name?: string;
  instruction?: string;
  organization?: string;
  image?: string;
  jobTitle?: string;
  roleType?: string;
  companyName?: string;
  knowledges?: KnowledgeItem[];
};

/**
 * Updates an account profile using the dedicated accounts API.
 */
export async function updateAccountProfile({
  accessToken,
  ...body
}: UpdateAccountProfileArgs) {
  const response = await fetch(`${getClientApiBaseUrl()}/api/accounts`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to update account: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}
