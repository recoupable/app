"use client";
import type { ReleaseCase } from "@/lib/releases/types";
import ReleaseStreams from "./ReleaseStreams";
export default function ReleaseStreamSection({
  current,
  accountId,
  organizationId,
  getAccessToken,
}: {
  current: ReleaseCase;
  accountId: string | null;
  organizationId: string | null;
  getAccessToken: () => Promise<string | null>;
}) {
  if (current.tracks.length > 0)
    return accountId ? (
      <ReleaseStreams
        current={current}
        accountId={accountId}
        organizationId={organizationId}
        getAccessToken={getAccessToken}
      />
    ) : null;
  return (
    <section
      aria-label="Release streams"
      className="space-y-2 rounded-xl bg-card p-6 shadow-[0_0_0_1px_var(--border)]"
    >
      <h2 className="text-xl font-semibold">Streams</h2>
      <p className="text-sm text-muted-foreground">
        Save this release’s recording metadata and ISRCs to match its daily
        stream history.
      </p>
    </section>
  );
}
