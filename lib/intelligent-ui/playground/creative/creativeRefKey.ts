import type { CreativeRef } from "./types";

export function creativeRefKey(ref: CreativeRef): string {
  return JSON.stringify([ref.authority, ref.assetId, ref.version]);
}
