import { proxyPlayerRequest } from "@/lib/players/proxyPlayerRequest";
/** Forward signed listening events to the owning API. */
export async function POST(request: Request) {
  return proxyPlayerRequest(request, "events");
}
