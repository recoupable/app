/**
 *
 * @param error
 */
export function handleChatError(error: unknown) {
  console.error("[Chat] Error processing request:", {
    error,
    message: error instanceof Error ? error.message : "Unknown error",
  });

  return new Response(
    JSON.stringify({
      error: "Failed to process chat message",
      details: error instanceof Error ? error.message : "Unknown error",
    }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
