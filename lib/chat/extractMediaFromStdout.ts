export type MediaKind = "audio" | "video" | "image";

export interface ExtractedMedia {
  url: string;
  kind: MediaKind;
}

/** Response fields our own API returns a finished asset on. */
const MEDIA_FIELDS = [
  "audio_url",
  "audioUrl",
  "videoUrl",
  "video_url",
  "videoSourceUrl",
  "imageUrl",
  "image_url",
] as const;

const EXT_KIND: Record<string, MediaKind> = {
  mp3: "audio", wav: "audio", m4a: "audio", aac: "audio", flac: "audio", ogg: "audio",
  mp4: "video", mov: "video", webm: "video", m4v: "video",
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", avif: "image",
};

/**
 * Classify a media URL by extension, ignoring any query string.
 *
 * @param url - Absolute URL.
 * @returns The kind, or undefined when the extension is not media.
 */
function kindOf(url: string): MediaKind | undefined {
  const path = url.split(/[?#]/)[0];
  const ext = path.split(".").pop()?.toLowerCase();
  return ext ? EXT_KIND[ext] : undefined;
}

/**
 * Pull a finished media asset out of a `bash` result's stdout.
 *
 * The media URL lives in stdout, not in the command: `POST /api/music` answers
 * `202` with a generation id, and the audio URL only appears later in the
 * `GET /api/music/{id}` poll response. Matching on "the command mentioned
 * /api/music" would tell you a generation started, not where the file is
 * (recoupable/app#2052).
 *
 * Only well-known response fields are read, so arbitrary URLs the agent echoed
 * from a scraped page never become an embedded player.
 *
 * @param stdout - Combined stdout from the tool result.
 * @returns The first media asset found, or null.
 */
export function extractMediaFromStdout(stdout: string | undefined): ExtractedMedia | null {
  if (!stdout) return null;

  const trimmed = stdout.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }

  const seen = new Set<unknown>();
  const walk = (node: unknown): ExtractedMedia | null => {
    if (node === null || typeof node !== "object" || seen.has(node)) return null;
    seen.add(node);

    if (Array.isArray(node)) {
      for (const item of node) {
        const hit = walk(item);
        if (hit) return hit;
      }
      return null;
    }

    const record = node as Record<string, unknown>;
    for (const field of MEDIA_FIELDS) {
      const value = record[field];
      if (typeof value !== "string" || !/^https?:\/\//.test(value)) continue;
      const kind = kindOf(value);
      if (kind) return { url: value, kind };
    }

    for (const value of Object.values(record)) {
      const hit = walk(value);
      if (hit) return hit;
    }
    return null;
  };

  return walk(parsed);
}
