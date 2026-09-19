import { proxySitesRequest } from "@/lib/sites/proxySitesRequest";
/** Read authorized signup data from the Sites API. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxySitesRequest(
    request,
    "/" + encodeURIComponent((await params).id) + "/signups",
  );
}
