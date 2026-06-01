import type { ProvisionChatSessionInput } from "@/lib/sessions/provisionChatSession";

interface ShouldProvisionChatSessionParams {
  enabled: boolean;
  artistId: string | undefined;
  orgId: string | undefined;
  lastVariables: ProvisionChatSessionInput | undefined;
  isPending: boolean;
  isSuccess: boolean;
}

/**
 * Returns whether `useProvisionChatSession` should call `mutate()` for the
 * current `(artistId, orgId)` inputs. Prevents duplicate POSTs when react
 * re-renders with the same inputs, and avoids starting a second provision
 * while a mismatched request is still in flight (inputs changed mid-flight).
 */
export function shouldProvisionChatSession({
  enabled,
  artistId,
  orgId,
  lastVariables,
  isPending,
  isSuccess,
}: ShouldProvisionChatSessionParams): boolean {
  if (!enabled) {
    return false;
  }

  const sameInputs =
    lastVariables !== undefined &&
    lastVariables.artistId === artistId &&
    lastVariables.orgId === orgId;

  if (sameInputs && (isPending || isSuccess)) {
    return false;
  }

  if (
    isPending &&
    lastVariables !== undefined &&
    (lastVariables.artistId !== artistId || lastVariables.orgId !== orgId)
  ) {
    return false;
  }

  return true;
}
