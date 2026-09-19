import { proxySitesRequest } from "@/lib/sites/proxySitesRequest";
export const maxDuration = 300;
/** Forward listing to the canonical Sites API. */
export async function GET(request: Request) {
  return proxySitesRequest(request, new URL(request.url).search);
}
/** Forward draft creation to the canonical Sites API. */
export async function POST(request: Request) {
  return proxySitesRequest(request, "");
}
