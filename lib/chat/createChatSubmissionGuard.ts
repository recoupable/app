/** Hold the send lock through preparation and response completion, before React can rerender. */
export function createChatSubmissionGuard() {
  let pending: { isCurrent?: () => boolean } | undefined;
  return async (
    submit: () => Promise<void>,
    isCurrent?: () => boolean,
  ): Promise<void> => {
    if (pending && pending.isCurrent?.() !== false) return;
    const operation = { isCurrent };
    pending = operation;
    try {
      await submit();
    } finally {
      if (pending === operation) pending = undefined;
    }
  };
}
