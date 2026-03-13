// Telegram message length limit is 4096 characters
const MAX_MESSAGE_LENGTH = 4000; // Using slightly less than 4096 to be safe

/**
 * Trims a message to fit within Telegram's character limit
 *
 * @param text - The text message to trim
 * @returns Trimmed text that fits within Telegram's message limits
 */
export const trimMessage = (text: string): string => {
  if (text.length <= MAX_MESSAGE_LENGTH) {
    return text;
  }

  return text.substring(0, MAX_MESSAGE_LENGTH - 15) + "...[trimmed]";
};
