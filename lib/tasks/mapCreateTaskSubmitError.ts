/** Maps raw API / network errors to user-facing submit messages. */
export function mapCreateTaskSubmitError(rawMessage: string): string {
  if (rawMessage.includes("HTTP 500")) {
    return "Server failed to create the task. Verify cron/model fields and try a schedule preset.";
  }
  return rawMessage;
}
