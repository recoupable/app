import { creativeDraftSchema, type CreativeDraft } from "./types";
import { creativeRefKey } from "./creativeRefKey";

export function readCreativeDraft(raw: string | null): CreativeDraft | null {
  if (!raw || raw.length > 20000) return null;
  try {
    const result = creativeDraftSchema.safeParse(JSON.parse(raw));
    if (!result.success) return null;
    const keys = result.data.notes.map((note) => creativeRefKey(note.ref));
    return new Set(keys).size === keys.length ? result.data : null;
  } catch {
    return null;
  }
}
