import type { ProvisionChatSessionInput } from "@/lib/sessions/provisionChatSession";

/** True when `lastVariables` matches the current `(artistId, orgId)` pair. */
export function provisionInputsMatch(
  lastVariables: ProvisionChatSessionInput | undefined,
  artistId: string | undefined,
  orgId: string | undefined,
): boolean {
  return (
    lastVariables !== undefined &&
    lastVariables.artistId === artistId &&
    lastVariables.orgId === orgId
  );
}
