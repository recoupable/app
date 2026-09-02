import { cn } from "@/lib/utils";

/**
 * The message a person sent while the workspace was still provisioning, shown
 * in the thread as if it had gone — because from their side it has.
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
  <div className="flex w-full flex-col gap-8" data-testid="pending-message">
    <div className="flex w-full justify-end">
      <div
        className={cn(
          "flex flex-col gap-4 text-foreground dark:text-white",
          "bg-muted px-4 py-2.5 rounded-3xl rounded-br-lg border border-border dark:border-gray-600 shadow-sm",
        )}
      >
        {text}
      </div>
    </div>

    <div
      role="status"
      className="flex w-full items-center gap-2 text-sm text-muted-foreground"
    >
      <span className="inline-block size-1.5 shrink-0 animate-pulse rounded-full bg-muted-foreground" />
      Sending as soon as your workspace is ready
    </div>
  </div>
);

export default PendingMessagePreview;
