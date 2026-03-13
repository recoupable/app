import { NextRequest } from "next/server";
import { getCorsHeaders } from "@/lib/chat/getCorsHeaders";
import { proxyToApiChat } from "@/lib/chat/proxyToApiChat";

// Handle OPTIONS preflight requests
/**
 *
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

/**
 * POST /api/chat/generate
 *
 * Non-streaming chat endpoint that proxies requests to recoup-api.
 *
 * Authentication: Authorization header (Bearer token) or x-api-key header required.
 * The account ID is inferred from the authentication.
 *
 * Request body:
 * - messages: Array of chat messages (mutually exclusive with prompt)
 * - prompt: String prompt (mutually exclusive with messages)
 * - roomId: Optional UUID of the chat room
 * - artistId: Optional UUID of the artist account
 * - model: Optional model ID override
 * - excludeTools: Optional array of tool names to exclude
 * - accountId: Optional accountId override (requires org API key)
 *
 * Response body:
 * - text: The generated text response
 * - reasoningText: Optional reasoning text (for models that support it)
 * - sources: Array of sources used in generation
 * - finishReason: The reason generation finished
 * - usage: Token usage information
 * - response: Additional response metadata
 *
 * @param request - The request object
 * @returns A JSON response from recoup-api
 */
export async function POST(request: NextRequest) {
  return proxyToApiChat(request, { streaming: false });
}
