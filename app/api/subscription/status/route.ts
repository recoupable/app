import { NextRequest, NextResponse } from "next/server";
import { NEW_API_BASE_URL } from "@/lib/consts";

export interface ProStatusResponse {
  isPro: boolean;
}

/**
 * GET /api/subscription/status?accountId=...
 * Proxies to Recoup API GET /api/subscriptions/status with the same query and auth headers.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (accountId === null || accountId === "") {
    return NextResponse.json(
      { error: "accountId is required" },
      { status: 400 },
    );
  }

  const upstreamUrl = new URL(`${NEW_API_BASE_URL}/api/subscriptions/status`);
  upstreamUrl.searchParams.set("accountId", accountId);

  const authorization = req.headers.get("authorization");
  const apiKey = req.headers.get("x-api-key");
  const upstreamHeaders = new Headers();
  if (authorization) {
    upstreamHeaders.set("authorization", authorization);
  }
  if (apiKey) {
    upstreamHeaders.set("x-api-key", apiKey);
  }

  const upstream = await fetch(upstreamUrl, {
    method: "GET",
    headers: upstreamHeaders,
    cache: "no-store",
  });

  const body = await upstream.text();
  const contentType =
    upstream.headers.get("content-type") ?? "application/json";

  return new NextResponse(body, {
    status: upstream.status,
    headers: { "Content-Type": contentType },
  });
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
