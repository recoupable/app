/** Composer recovery copy; HTTP status remains a separate diagnostic. */
export function getChatSendErrorMessage(error: Error & { status?: number }) {
  if (
    error.status === 401 ||
    error.status === 403 ||
    /sign in|access token/i.test(error.message)
  )
    return "Please sign in again to send this message.";
  if (error.status === 409)
    return "Another response is running. Retry when it finishes.";
  if (error.status === 429) return "Please wait a moment, then retry.";
  if (error.status === 503) return "Chat is unavailable. Please retry shortly.";
  if (error.status !== undefined)
    return "Couldn’t send this message. Please retry.";
  return "Couldn’t confirm this message was sent. Please retry.";
}
