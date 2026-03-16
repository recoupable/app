const TASK_NAME_MAP: Record<string, string> = {
  "run-sandbox-command": "Agent Sandbox",
  "customer-prompt-task": "Scheduled Task",
  "setup-sandbox": "Setup Sandbox",
  "send-pulses": "Send Pulses",
  "send-pulse-task": "Pulse",
  "pro-artist-social-profiles-scrape": "Social Scrape",
};

export function getTaskDisplayName(taskIdentifier: string): string {
  return TASK_NAME_MAP[taskIdentifier] ?? taskIdentifier;
}
