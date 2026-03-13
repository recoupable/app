import { NextRequest } from "next/server";
import { NEW_API_BASE_URL } from "@/lib/consts";

/**
 * @param req
 * @deprecated This endpoint is deprecated. Use recoup-api directly at POST /api/workspaces
 *
 * Create a blank workspace for an account.
 * This route now proxies to recoup-api for workspace creation.
 */
export async function POST(req: NextRequest) {
  const sunsetDate = new Date("2026-03-01");
  const deprecationHeaders = {
    Deprecation: "true",
    Sunset: sunsetDate.toUTCString(),
    Link: `<${NEW_API_BASE_URL}/api/workspaces>; rel="deprecation"`,
  };

  try {
    const body = await req.text();

    // Forward auth headers to recoup-api
    const headers = new Headers();
    const authHeader = req.headers.get("authorization");
    const apiKeyHeader = req.headers.get("x-api-key");

    if (authHeader) {
      headers.set("authorization", authHeader);
    }
    if (apiKeyHeader) {
      headers.set("x-api-key", apiKeyHeader);
    }
    headers.set("Content-Type", "application/json");

    const response = await fetch(`${NEW_API_BASE_URL}/api/workspaces`, {
      method: "POST",
      headers,
      body,
    });

    const responseData = await response.json();

    return Response.json(responseData, {
      status: response.status,
      headers: deprecationHeaders,
    });
  } catch (error) {
    console.error("Error proxying workspace creation:", error);
    const message = error instanceof Error ? error.message : "Failed to create workspace";
    return Response.json(
      { status: "error", error: message },
      { status: 500, headers: deprecationHeaders },
    );
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
