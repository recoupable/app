const SUCCESS_STATUSES = new Set(["COMPLETED"]);
const ERROR_STATUSES = new Set(["FAILED", "CRASHED", "SYSTEM_FAILURE", "INTERRUPTED"]);
const ACTIVE_STATUSES = new Set(["EXECUTING", "REATTEMPTING"]);

/**
 *
 * @param status
 */
export function getStatusColor(status: string): string {
  if (SUCCESS_STATUSES.has(status)) {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  }
  if (ERROR_STATUSES.has(status)) {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
  if (ACTIVE_STATUSES.has(status)) {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  }
  return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
}
