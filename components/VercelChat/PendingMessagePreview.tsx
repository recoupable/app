"use client";

import MessageFrame from "./MessageFrame";
import Message from "./message";
import { useCyclingText } from "@/hooks/useCyclingText";
import {
  WORKSPACE_SETUP_MESSAGES,
  WORKSPACE_SETUP_CYCLE_MS,
} from "@/lib/chat/workspaceSetupMessages";
import { EnhancedReasoning } from "@/components/reasoning/EnhancedReasoning";

/**
 * The message a person sent while the workspace was still provisioning, shown
 * in the thread as if it had gone — because from their side it has. Beneath it,
 * the reasoning shell with a workspace-setup placeholder, so the wait and the
 * thinking that follows read as one continuous state.
 *
 * The sandbox takes around 17 seconds, and the session and chat exist for all
 * of it. Holding the person on the home page with a hint gave them no reason
 * to believe the chat had begun; showing their message under its own chat URL,
 * with the assistant visibly waiting, does (recoupable/app#2052).
 *
 * Deliberately NOT pushed into `messages`: the real send appends it there when
 * the workspace is ready, and a copy in both places would render twice.
 */
const PendingMessagePreview = ({ text }: { text: string }) => {
  // A single static line reads as stalled over a ~14s wait; advancing the
  // text on a fixed cadence gives honest progress without promising a time.
  const placeholder = useCyclingText(WORKSPACE_SETUP_MESSAGES, WORKSPACE_SETUP_CYCLE_MS);

  return (
  <div className="contents" data-testid="pending-message">
    {/* Rendered through Message, not a look-alike bubble: the real one carries a
        32px hidden Actions row beneath it, and without that the assistant shell
        below sat 14px higher than where it lands after the send. */}
    <Message
      message={{ id: "pending-user", role: "user", parts: [{ type: "text", text }] }}
      status="ready"
    />

    {/* Same frame and same component the reasoning stream renders in, so
        when the assistant starts thinking only the header text changes. */}
    <MessageFrame role="assistant" testId="pending-assistant">
      <EnhancedReasoning isStreaming placeholder={placeholder} />
    </MessageFrame>
  </div>
  );
};

export default PendingMessagePreview;
