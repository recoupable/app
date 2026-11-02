import { createHash } from "node:crypto";
import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";
import { audioExcerpts } from "@/lib/intelligent-ui/playground/creative/audioExcerpts";
import { createAudioExcerpt } from "@/lib/intelligent-ui/playground/creative/createAudioExcerpt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Small complete WAV responses. Never substitute bytes for an unknown revision. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ revision: string }> },
): Promise<Response> {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (!isChatIntelligentUIEnabled())
    return new Response(null, { status: 404, headers });
  const { revision } = await params;
  const name = (
    Object.keys(audioExcerpts) as (keyof typeof audioExcerpts)[]
  ).find((key) => audioExcerpts[key].version === revision);
  if (!name) return new Response(null, { status: 404, headers });
  const bytes = createAudioExcerpt(name);
  if (createHash("sha256").update(bytes).digest("hex") !== revision)
    return new Response(null, { status: 503, headers });
  headers.set("Content-Type", "audio/wav");
  headers.set("Content-Length", String(bytes.length));
  return new Response(bytes, { headers });
}
