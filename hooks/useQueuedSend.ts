"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Holds one message that was submitted before the workspace was ready, and
 * fires it the moment it becomes ready.
 *
 * Instance-scoped by design: the queue is a property of this composer, not of
 * the session, so nothing is persisted and a reload discards it rather than
 * sending something the person has forgotten about.
 *
 * @param workspaceReady - Whether the session's sandbox has finished provisioning.
 * @param send - The real send, invoked once on the ready edge.
 * @returns `queue` to hold a submission, `queued` for rendering it as pending,
 *   and `clearQueued` to drop it.
 */
export function useQueuedSend(workspaceReady: boolean, send: () => void) {
  const [queued, setQueued] = useState<string | null>(null);
  // Read in the ready effect without making `send` a dependency, so a new
  // closure each render cannot re-fire an already-sent message.
  const sendRef = useRef(send);
  sendRef.current = send;

  useEffect(() => {
    if (!workspaceReady || queued === null) return;
    // Clearing here is the point of the effect, not an accident of it: this is
    // an edge trigger, and the queue must empty in the same tick it fires so a
    // re-render cannot send the message twice.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQueued(null);
    sendRef.current();
  }, [workspaceReady, queued]);

  return {
    queued,
    queue: (text: string) => setQueued(text),
    clearQueued: () => setQueued(null),
  };
}
