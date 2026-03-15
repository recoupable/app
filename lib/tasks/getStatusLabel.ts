const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Completed",
  FAILED: "Failed",
  CRASHED: "Crashed",
  CANCELED: "Canceled",
  SYSTEM_FAILURE: "System Failure",
  INTERRUPTED: "Interrupted",
  EXECUTING: "Executing",
  REATTEMPTING: "Reattempting",
  QUEUED: "Queued",
  DELAYED: "Delayed",
  FROZEN: "Frozen",
  PENDING_VERSION: "Pending Version",
};

/**
 *
 * @param status
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
