import { proxyPlayerRequest } from "@/lib/players/proxyPlayerRequest";
/** Credentials are exchanged by API and returned only to the trusted player browser. */
export async function POST(request: Request) {
  return proxyPlayerRequest(request, "spotify/session");
}
