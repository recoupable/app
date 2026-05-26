/**
 * Converts an arbitrary string into kebab-case slug form.
 *   - lowercases
 *   - collapses any non-alphanumeric runs to a single `-`
 *   - trims leading / trailing `-`
 *
 * Used to build per-org and per-account repo URLs from human-entered
 * names. Ported from open-agents `apps/web/lib/string/to-kebab-case.ts`.
 */
export function toKebabCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
