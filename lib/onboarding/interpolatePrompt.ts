/**
 * Interpolates placeholders in an onboarding template prompt.
 * Replaces {artistName} and {userEmail} with actual values.
 */
export function interpolatePrompt(
  prompt: string,
  artistName: string,
  userEmail: string
): string {
  return prompt
    .replace(/\{artistName\}/g, artistName)
    .replace(/\{userEmail\}/g, userEmail);
}

export default interpolatePrompt;
