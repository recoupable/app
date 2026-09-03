/**
 * What the assistant shell says while the sandbox is provisioning, in order.
 *
 * The wait is around 14 seconds and a single static line reads as stalled, so
 * the text advances through these on a fixed cadence. Each one describes work
 * that is genuinely happening during `POST /api/sandbox`; none promises
 * imminence, because at four seconds into fourteen "almost ready" would be
 * untrue (recoupable/app#2052).
 */
export const WORKSPACE_SETUP_MESSAGES = [
  "Setting up your workspace",
  "Provisioning your sandbox",
  "Installing your tools",
  "Loading your skills",
  "Connecting to your roster",
  "Warming up the workspace",
  "Getting everything in place",
  "Nearly there",
] as const;

/** Milliseconds each message is shown before advancing. */
export const WORKSPACE_SETUP_CYCLE_MS = 4000;
