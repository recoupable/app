import { isPlaygroundEnabled } from "@/lib/intelligent-ui/playground/isPlaygroundEnabled";
import { createSectionStudyAudio } from "@/lib/intelligent-ui/playground/createSectionStudyAudio";

export const dynamic = "force-dynamic";
let fixture: Uint8Array<ArrayBuffer> | undefined;

/** A gated, seekable original fixture; asset identity is resolved by the host. */
export function GET(request: Request): Response {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (!isPlaygroundEnabled())
    return new Response(null, { status: 404, headers });
  fixture ??= createSectionStudyAudio();
  headers.set("Content-Type", "audio/wav");
  headers.set("Accept-Ranges", "bytes");
  const range = request.headers.get("range");
  if (!range) {
    headers.set("Content-Length", String(fixture.length));
    return new Response(fixture, { headers });
  }
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let start = 0;
  let end = fixture.length - 1;
  if (match?.[1]) {
    start = Number(match[1]);
    if (match[2]) end = Number(match[2]);
  } else if (match?.[2]) start = Math.max(0, fixture.length - Number(match[2]));
  if (
    !match ||
    (match[1] !== "" && !Number.isSafeInteger(Number(match[1]))) ||
    (match[2] !== "" && !Number.isSafeInteger(Number(match[2]))) ||
    (!match[1] && (!match[2] || Number(match[2]) === 0)) ||
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start >= fixture.length ||
    end < start
  ) {
    headers.set("Content-Range", `bytes */${fixture.length}`);
    return new Response(null, { status: 416, headers });
  }
  end = Math.min(end, fixture.length - 1);
  headers.set("Content-Range", `bytes ${start}-${end}/${fixture.length}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(fixture.slice(start, end + 1), { status: 206, headers });
}
