/**
 * Fire-and-forget call to trigger sandbox provisioning for an account.
 * The API handler is idempotent — it returns early if already provisioned.
 *
 * @param accountId - The account ID to provision a sandbox for
 */
export function triggerSandboxSetup(accountId: string): void {
  fetch("/api/sandboxes/setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account_id: accountId }),
  }).catch(() => {});
}
