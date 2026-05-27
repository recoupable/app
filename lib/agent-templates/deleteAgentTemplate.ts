import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

type DeleteAgentTemplateResponse =
  | { status: "success" }
  | { status: "error"; error: string };

const deleteAgentTemplate = async (
  accessToken: string,
  templateId: string,
): Promise<void> => {
  const res = await fetch(
    `${getClientApiBaseUrl()}/api/agents/templates/${templateId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = (await res
    .json()
    .catch(() => null)) as DeleteAgentTemplateResponse | null;

  if (!res.ok || data?.status !== "success") {
    throw new Error(
      (data?.status === "error" && data.error) || "Failed to delete template",
    );
  }
};

export default deleteAgentTemplate;
