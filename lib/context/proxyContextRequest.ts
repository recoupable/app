import { API_PUBLIC_BASE_URL } from "@/lib/consts";
/** Preserve the guest session across the app/API boundary without forwarding other cookies. */
export async function proxyContextRequest(
  request: Request,
  path: "" | "/guest" | "/guest/claim",
) {
  const origin = request.headers.get("origin");
  if (request.method === "POST" && origin !== new URL(request.url).origin)
    return Response.json({ error: "Origin not allowed" }, { status: 403 });
  const headers = new Headers();
  for (const key of ["authorization", "content-type", "origin"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  if (path) {
    const cookie = request.headers
      .get("cookie")
      ?.split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("recoup_context_guest="));
    if (cookie) headers.set("cookie", cookie);
  }
  try {
    const base = (process.env.CONTEXT_API_URL || API_PUBLIC_BASE_URL).replace(
      /\/$/,
      "",
    );
    const upstream = await fetch(`${base}/api/context${path}`, {
      method: request.method,
      headers,
      cache: "no-store",
      redirect: "error",
      body: request.method === "GET" ? undefined : await request.arrayBuffer(),
      signal: AbortSignal.timeout(30000),
    });
    const output = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    });
    const cookie = upstream.headers.get("set-cookie");
    if (path && cookie?.startsWith("recoup_context_guest="))
      output.set("set-cookie", cookie);
    return new Response(upstream.body, {
      status: upstream.status,
      headers: output,
    });
  } catch {
    return Response.json(
      { error: "Context service is unavailable. Please retry." },
      { status: 503 },
    );
  }
}
