/**
 * Resolve after a delay.
 *
 * @param ms - Milliseconds to wait.
 * @returns A promise that resolves once the delay has elapsed.
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
