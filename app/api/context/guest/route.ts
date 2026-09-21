import { proxyContextRequest } from "@/lib/context/proxyContextRequest";
/** Forward context operations to the canonical API. */
export async function GET(request: Request) {
  return proxyContextRequest(request, "/guest");
}
/** Forward context operations to the canonical API. */
export async function POST(request: Request) {
  return proxyContextRequest(request, "/guest");
}
