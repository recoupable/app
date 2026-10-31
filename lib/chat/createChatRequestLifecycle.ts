/** Coordinates preparation and HTTP admission independently of the SDK reader. */
export function createChatRequestLifecycle() {
  const operations = new Set<ReturnType<typeof begin>>();
  let requestIndex = 0;
  let admittedIndex = 0;
  let unknownIndex = 0;
  function begin() {
    const index = ++requestIndex;
    const controller = new AbortController();
    const readerController = new AbortController();
    let dispatched = false;
    let settled = false;
    let resolveAdmission!: () => void;
    const admission = new Promise<void>((resolve) => {
      resolveAdmission = resolve;
    });
    const operation = {
      controller,
      readerController,
      admission,
      markUnknown: () => {
        if (operations.has(operation) && !controller.signal.aborted)
          unknownIndex = Math.max(unknownIndex, index);
      },
      admit: () => {
        // A newer confirmed POST supersedes older ambiguity; an older late
        // admission must not erase a newer unknown request.
        if (operations.has(operation) && !controller.signal.aborted)
          admittedIndex = Math.max(admittedIndex, index);
      },
      dispatched: () => {
        dispatched = true;
      },
      isDispatched: () => dispatched,
      settle: () => {
        if (!settled) {
          settled = true;
          resolveAdmission();
        }
      },
      cancelPreparation: () => {
        if (!dispatched) {
          controller.abort();
          operation.settle();
        }
      },
      dispose: () => {
        operation.settle();
        operations.delete(operation);
      },
    };
    operations.add(operation);
    return operation;
  }
  return {
    begin,
    hasUnknownAdmission: () => unknownIndex > admittedIndex,
    hasDispatchedRequest: () =>
      [...operations].some((operation) => operation.isDispatched()),
    confirmStopped: () => {
      admittedIndex = requestIndex;
    },
    detachReaders: () =>
      operations.forEach((operation) => operation.readerController.abort()),
    cancelPreparation: () =>
      operations.forEach((operation) => operation.cancelPreparation()),
    waitForAdmission: () =>
      Promise.all([...operations].map((operation) => operation.admission)),
    cancelAll: () => {
      admittedIndex = requestIndex;
      operations.forEach((operation) => {
        operation.controller.abort();
        operation.dispose();
      });
    },
  };
}

export type ChatRequestLifecycle = ReturnType<
  typeof createChatRequestLifecycle
>;

/** Local callbacks travel in SDK metadata, never in the serialized request body. */
export interface ChatAdmissionMetadata {
  isCurrent: () => boolean;
  onAccepted: (ids: { chatId: string; sessionId?: string }) => void;
  onRejected: (error: Error & { status?: number }) => void;
}
