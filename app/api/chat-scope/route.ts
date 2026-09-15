import { getChatScope } from "@/lib/chat/server/getChatScope";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return getChatScope(request);
}
