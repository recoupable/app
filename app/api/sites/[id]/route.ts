import { proxySitesRequest } from "@/lib/sites/proxySitesRequest";
export const maxDuration = 300;
type Context = { params: Promise<{ id: string }> };
/** Read through the authenticated Sites API. */
export async function GET(request: Request, { params }: Context) {
  return proxySitesRequest(
    request,
    "/" + encodeURIComponent((await params).id),
  );
}
/** Forward generation and publishing without local domain logic. */
export async function PATCH(request: Request, { params }: Context) {
  return proxySitesRequest(
    request,
    "/" + encodeURIComponent((await params).id),
  );
}
