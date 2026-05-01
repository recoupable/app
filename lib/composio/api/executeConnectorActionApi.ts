import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface ExecuteConnectorActionParams {
  actionSlug: string;
  parameters: Record<string, unknown>;
  accountId?: string;
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

  const body = await response.json();
  const result = body.result as
    | { successful?: boolean; data?: unknown; error?: string | null }
    | unknown;

  if (
    result &&
    typeof result === "object" &&
    "successful" in (result as Record<string, unknown>)
  ) {
    const envelope = result as {
      successful: boolean;
      data?: unknown;
      error?: string | null;
    };
    if (!envelope.successful) {
      throw new Error(envelope.error ?? "Connector action failed");
    }
    return envelope.data as T;
  }

  return result as T;
}
