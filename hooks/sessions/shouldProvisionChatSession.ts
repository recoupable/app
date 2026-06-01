import type { ProvisionChatSessionInput } from "@/lib/sessions/provisionChatSession";

interface ShouldProvisionChatSessionParams {
  enabled: boolean;
  artistId: string | undefined;
  orgId: string | undefined;
  lastVariables: ProvisionChatSessionInput | undefined;
  isPending: boolean;
  isSuccess: boolean;
}

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

/**
 * Returns whether `useProvisionChatSession` should call `mutate()` for the
 * current `(artistId, orgId)` inputs. Prevents duplicate POSTs when react
 * re-renders with the same inputs, and avoids starting a second provision
 * while a mismatched request is still in flight (inputs changed mid-flight).
 * Callers must re-run the effect when `isPending` settles so deferred inputs
 * provision after the in-flight request completes.
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

  const sameInputs = provisionInputsMatch(lastVariables, artistId, orgId);

  if (sameInputs && (isPending || isSuccess)) {
    return false;
  }

  if (
    isPending &&
    lastVariables !== undefined &&
    !sameInputs
  ) {
    return false;
  }

  return true;
}
