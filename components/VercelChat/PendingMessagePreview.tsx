import { cn } from "@/lib/utils";
import MessageFrame from "./MessageFrame";
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
const PendingMessagePreview = ({ text }: { text: string }) => (
  <div className="contents" data-testid="pending-message">
    <MessageFrame role="user" testId="pending-user">
      <div
        className={cn(
          "flex flex-col gap-4 text-foreground dark:text-white",
          "bg-muted px-4 py-2.5 rounded-3xl rounded-br-lg border border-border dark:border-gray-600 shadow-sm",
        )}
      >
        {text}
      </div>
    </MessageFrame>

    {/* Same frame and same component the reasoning stream renders in, so
        when the assistant starts thinking only the header text changes. */}
    <MessageFrame role="assistant" testId="pending-assistant">
      <EnhancedReasoning isStreaming placeholder="Setting up your workspace" />
    </MessageFrame>
  </div>
);

export default PendingMessagePreview;
