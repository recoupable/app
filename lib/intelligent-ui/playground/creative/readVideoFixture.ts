import { open } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { videoClips } from "./videoClips";

/** Exact fixed paths and bounded reads; never return substituted or modified media. */
export async function readVideoFixture(
  revision: string,
): Promise<Uint8Array<ArrayBuffer> | undefined> {
  const clip = Object.values(videoClips).find(
    (item) => item.version === revision,
  );
  if (!clip || clip.bytes > 65536) return undefined;
  try {
    const file = await open(
      join(
        process.cwd(),
        "lib/intelligent-ui/playground/creative/fixtures/video",
        clip.file,
      ),
      "r",
    );
    try {
      const stat = await file.stat();
      if (!stat.isFile() || stat.size !== clip.bytes) return undefined;
      const bytes = new Uint8Array(clip.bytes + 1);
      const { bytesRead } = await file.read(bytes, 0, bytes.length, 0);
      const body = bytes.slice(0, bytesRead);
      if (
        bytesRead !== clip.bytes ||
        new TextDecoder().decode(body.subarray(4, 8)) !== "ftyp" ||
        createHash("sha256").update(body).digest("hex") !== revision
      )
        return undefined;
      return body;
    } finally {
      await file.close();
    }
  } catch {
    return undefined;
  }
}
