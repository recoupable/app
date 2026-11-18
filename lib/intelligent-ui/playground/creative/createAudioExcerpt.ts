import { createSectionStudyAudio } from "../createSectionStudyAudio";
import { audioExcerpts } from "./audioExcerpts";

/** Preserve original PCM samples; only the WAV length fields are rewritten. */
export function createAudioExcerpt(
  name: keyof typeof audioExcerpts,
): Uint8Array<ArrayBuffer> {
  const full = createSectionStudyAudio();
  const { startSeconds, endSeconds } = audioExcerpts[name];
  const bytesPerSecond = 22050 * 2;
  const bytes = new Uint8Array(
    44 + (endSeconds - startSeconds) * bytesPerSecond,
  );
  bytes.set(full.subarray(0, 44));
  bytes.set(
    full.subarray(
      44 + startSeconds * bytesPerSecond,
      44 + endSeconds * bytesPerSecond,
    ),
    44,
  );
  const view = new DataView(bytes.buffer);
  view.setUint32(4, bytes.length - 8, true);
  view.setUint32(40, bytes.length - 44, true);
  return bytes;
}
