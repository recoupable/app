import { NextResponse, type NextRequest } from "next/server";
import { isPlaygroundEnabled } from "@/lib/intelligent-ui/playground/isPlaygroundEnabled";
import { isPlaygroundRoute } from "@/lib/intelligent-ui/playground/isPlaygroundRoute";

/** Deny before the root Suspense boundary can start a 200 streaming response. */
export function proxy(request: NextRequest) {
  if (isPlaygroundRoute(request.nextUrl.pathname) && !isPlaygroundEnabled()) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    });
  }
  return NextResponse.next();
}

export const config = { matcher: "/labs/intelligent-ui" };
