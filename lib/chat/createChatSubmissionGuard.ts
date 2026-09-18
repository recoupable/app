/** Hold the send lock through preparation and response completion, before React can rerender. */
export function createChatSubmissionGuard() {
  let pending = false;
  return async (submit: () => Promise<void>): Promise<void> => {
    if (pending) return;
    pending = true;
    try {
      await submit();
    } finally {
      pending = false;
    }
  };
}
