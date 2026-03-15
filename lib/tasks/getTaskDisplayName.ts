const TASK_NAME_MAP: Record<string, string> = {
  "run-sandbox-command": "Sandbox Command",
  "customer-prompt-task": "Scheduled Prompt",
  "setup-sandbox": "Setup Sandbox",
  "send-pulses": "Send Pulses",
  "pro-artist-social-profiles-scrape": "Social Scrape",
};

/**
 *
 * @param taskIdentifier
 */
export function getTaskDisplayName(taskIdentifier: string): string {
  return TASK_NAME_MAP[taskIdentifier] ?? taskIdentifier;
}
