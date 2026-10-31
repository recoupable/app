/** Stop stays retryable until the server result is confirmed. */
export function getChatStopErrorMessage({
  httpStatus,
  reason,
}: {
  httpStatus?: number;
  reason?: "auth" | "starting" | "message-unconfirmed";
}) {
  if (reason === "auth" || httpStatus === 401 || httpStatus === 403)
    return "Please sign in again to stop this response.";
  if (reason === "starting")
    return "This response is still starting. Retry Stop shortly.";
  if (reason === "message-unconfirmed")
    return "The message may still be starting. Retry Stop to confirm.";
  return "Couldn’t confirm Stop. Please retry.";
}
