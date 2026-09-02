/**
 * Tells the person a Send they pressed is waiting on the workspace, and will
 * go on its own.
 *
 * Without it a send during provisioning looks like nothing happened, which is
 * the failure this row exists to fix — an interested person types, appears to
 * be ignored, and leaves (recoupable/app#2052).
 */
const QueuedSendNotice = () => (
  <div
    role="status"
    className="absolute bottom-[100%] left-0 mb-2 flex w-full items-center gap-2 px-1 text-xs text-muted-foreground"
  >
    <span className="inline-block size-1.5 shrink-0 animate-pulse rounded-full bg-muted-foreground" />
    <span className="truncate">Sending as soon as your workspace is ready</span>
  </div>
);

export default QueuedSendNotice;
