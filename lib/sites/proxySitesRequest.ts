import { getSitesApiUrl } from "./getSitesApiUrl";
/** Thin same-origin transport. All validation, authorization and persistence live in the API service. */
export async function proxySitesRequest(request: Request, path: string) {
  const headers = new Headers();
  for (const name of ["authorization", "content-type"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const upstream = await fetch(`${getSitesApiUrl()}/api/sites${path}`, {
      method: request.method,
      headers,
      cache: "no-store",
      redirect: "error",
      body: ["GET", "HEAD"].includes(request.method)
        ? undefined
        : await request.arrayBuffer(),
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "Sites service is unavailable. Please try again." },
      { status: 503 },
    );
  }
}
