import type { WorkspaceStatus } from "@/components/VercelChat/WorkspaceStatusIndicator";

/**
 * Resolves once the workspace reports `ready`; rejects on `off`, the terminal
 * provisioning failure, so a held send errors like any other failed request
 * instead of hanging. Polls a getter rather than subscribing so the caller can
 * hand it a ref and keep the chat transport instance stable (app#2052).
 */
export function waitForWorkspace(
  getStatus: () => WorkspaceStatus,
  intervalMs = 250,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const check = () => {
      const status = getStatus();
      if (status === "ready") return resolve();
      if (status === "off") {
        return reject(
          new Error("The workspace failed to start. Refresh and try again."),
        );
      }
      setTimeout(check, intervalMs);
    };
    check();
  });
}
