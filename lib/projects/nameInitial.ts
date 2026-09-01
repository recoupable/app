/**
 * The single letter an avatar falls back to when there is no image.
 *
 * `accounts.name` is blank on most accounts today, so this falls back to a dot
 * rather than rendering an empty circle or a stray letter from an email.
 */
export function nameInitial(name: string | null | undefined): string {
  return name?.trim()?.[0]?.toUpperCase() ?? "·";
}
