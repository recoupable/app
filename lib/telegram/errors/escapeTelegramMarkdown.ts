/**
 * Escapes special characters for Telegram Markdown to prevent parse errors.
 *
 * @param text - The string to escape
 * @returns Escaped string safe for Telegram Markdown
 */
export function escapeTelegramMarkdown(text: string): string {
  return text.replace(/[\_\*\[\]\(\)~`>#+\-=|{}.!]/g, match => `\\${match}`);
}
