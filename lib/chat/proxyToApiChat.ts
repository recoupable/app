import { NextRequest } from "next/server";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { getCorsHeaders } from "@/lib/chat/getCorsHeaders";
import { serializeError } from "@/lib/errors/serializeError";

export type ProxyOptions = {
  streaming: boolean;
};

const SUNSET_DAYS = 90;

/**
 *
 */
function getDeprecationHeaders(): Record<string, string> {
  const sunsetDate = new Date();
  sunsetDate.setDate(sunsetDate.getDate() + SUNSET_DAYS);

  return {
    Deprecation: "true",
    Sunset: sunsetDate.toUTCString(),
    Link: `<${NEW_API_BASE_URL}/api/chat>; rel="deprecation"`,
  };
}

/**
 * @deprecated This endpoint is deprecated. Use recoup-api directly at recoup-api.vercel.app/api/chat
 *
 * Proxies chat requests to recoup-api.
 *
 * This function forwards the incoming request to the appropriate recoup-api
 * chat endpoint, preserving authentication headers (Authorization, x-api-key)
 * and the request body.
 *
 * @param request - The incoming NextRequest
 * @param options - Options specifying whether to use streaming or non-streaming endpoint
 * @returns The proxied response from recoup-api
 */
export async function proxyToApiChat(
  request: NextRequest,
  options: ProxyOptions,
): Promise<Response> {
  const endpoint = options.streaming ? "/api/chat" : "/api/chat/generate";
  const url = `${NEW_API_BASE_URL}${endpoint}`;

  try {
    const headers = new Headers();

    const authHeader = request.headers.get("authorization");
    const apiKeyHeader = request.headers.get("x-api-key");

    if (authHeader) {
      headers.set("authorization", authHeader);
    }
    if (apiKeyHeader) {
      headers.set("x-api-key", apiKeyHeader);
    }

    headers.set("Content-Type", "application/json");

    const body = await request.text();

    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    const responseHeaders = new Headers(response.headers);
    const corsHeaders = getCorsHeaders();
    const deprecationHeaders = getDeprecationHeaders();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    Object.entries(deprecationHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (e) {
    console.error("💬 proxyToApiChat error:", e);
    return new Response(JSON.stringify(serializeError(e)), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(),
        ...getDeprecationHeaders(),
      },
    });
  }
}
