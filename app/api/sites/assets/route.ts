import { proxySitesRequest } from "@/lib/sites/proxySitesRequest";
/** Forward multipart uploads to the Sites API. */
export async function POST(request: Request) {
  return proxySitesRequest(request, "/assets" + new URL(request.url).search);
}
