"use client";
import { useReleaseStreams } from "@/hooks/useReleaseStreams";
import type { ReleaseCase } from "@/lib/releases/types";
import ReleaseStreamPanel from "./ReleaseStreamPanel";

/** Scope lifetime comes from the account/workspace/release key on the parent. */
export default function ReleaseStreams({
  current,
  accountId,
  organizationId,
  getAccessToken,
}: {
  current: ReleaseCase;
  accountId: string;
  organizationId: string | null;
  getAccessToken: () => Promise<string | null>;
}) {
  const data = useReleaseStreams(accountId, getAccessToken, organizationId);
  return <ReleaseStreamPanel current={current} data={data} />;
}
