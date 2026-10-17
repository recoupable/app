import type { RefinementCtx } from "zod";

/** Identity collisions make streamed updates and saved selections ambiguous. */
export function validateUniqueIds(
  ids: string[],
  ctx: RefinementCtx,
  path: (string | number)[],
) {
  const seen = new Set<string>();
  ids.forEach((id, index) => {
    if (seen.has(id)) {
      ctx.addIssue({
        code: "custom",
        path: [...path, index],
        message: `Duplicate ID: ${id}`,
      });
    }
    seen.add(id);
  });
}
