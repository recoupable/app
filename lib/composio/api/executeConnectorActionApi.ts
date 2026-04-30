import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface ExecuteConnectorActionParams {
  actionSlug: string;
  parameters: Record<string, unknown>;
  accountId?: string;
}

/**
 * Execute a connector action via the api's generic Composio action endpoint.
 * Returns the raw `result` field (action-specific, passed through from
 * Composio).
 *
 * @param accessToken - Bearer token for authentication
 * @param params - Action slug, parameters, optional account ID to scope the connection
 */
export async function executeConnectorActionApi<T = unknown>(
  accessToken: string,
  params: ExecuteConnectorActionParams,
): Promise<T> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/connectors/actions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        actionSlug: params.actionSlug,
        parameters: params.parameters,
        ...(params.accountId && { account_id: params.accountId }),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to execute connector action (${response.status})`);
  }

  const data = await response.json();
  return data.result as T;
}
