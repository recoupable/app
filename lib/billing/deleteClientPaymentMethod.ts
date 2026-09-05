import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/** DELETE /api/accounts/{id}/payment-method: detaches the default card. */
async function deleteClientPaymentMethod(
  accountId: string,
  accessToken: string,
): Promise<void> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/accounts/${accountId}/payment-method`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }
}

export default deleteClientPaymentMethod;
