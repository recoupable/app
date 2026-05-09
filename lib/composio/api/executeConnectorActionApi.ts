import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface ExecuteConnectorActionParams {
  actionSlug: string;
  parameters: Record<string, unknown>;
  accountId?: string;
}

interface ToolExecuteEnvelope<T> {
  successful: boolean;
  data?: T;
  error?: string | null;
}

/**
 * Execute a connector action via the api's generic Composio action endpoint.
 * Unwraps Composio's `ToolExecuteResponse` envelope so callers get the
 * underlying provider payload directly (e.g. Google `youtube.channels.list`
 * with `items`); throws on `successful: false`.
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

  const { result }: { result: ToolExecuteEnvelope<T> } = await response.json();
  if (!result.successful) {
    throw new Error(result.error ?? "Connector action failed");
  }
  return result.data as T;
}
