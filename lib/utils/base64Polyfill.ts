/**
 * Ensures base64 polyfills are available for environments that don't have them natively
 * (like Node.js server-side rendering contexts)
 */
export function ensureBase64Polyfills(): void {
  if (typeof globalThis.atob === "undefined") {
    globalThis.atob = (data: string) => Buffer.from(data, "base64").toString("binary");
  }

  if (typeof globalThis.btoa === "undefined") {
    globalThis.btoa = (data: string) => Buffer.from(data, "binary").toString("base64");
  }
}
