/** Byte limits bound buffering even when input contains multibyte UTF-8 text. */
export const SURFACE_STREAM_LIMITS = {
  lineBytes: 256 * 1024,
  totalBytes: 2 * 1024 * 1024,
  events: 256,
} as const;
