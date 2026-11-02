import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";
import { videoClips } from "@/lib/intelligent-ui/playground/creative/videoClips";
import { readVideoFixture } from "@/lib/intelligent-ui/playground/creative/readVideoFixture";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Small complete MP4 responses, including Range requests; no partial-content claim. */
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
  if (!Object.values(videoClips).some((clip) => clip.version === revision))
    return new Response(null, { status: 404, headers });
  const bytes = await readVideoFixture(revision);
  if (!bytes) return new Response(null, { status: 503, headers });
  headers.set("Content-Type", "video/mp4");
  headers.set("Content-Length", String(bytes.length));
  return new Response(bytes, { headers });
}
