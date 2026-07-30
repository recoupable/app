export type UserProfileState = "loading" | "signed-out" | "ready";

interface UserProfileStateInput {
  isPrivyReady: boolean;
  isAuthenticated: boolean;
  hasUserData: boolean;
}

/**
 * Decides what the sidebar's user slot should render.
 *
 * "signed-out" exists as a distinct state because rendering a loading skeleton
 * for a visitor with no session produces a menu that contradicts itself — a
 * Sign In button above a profile chip that can never resolve (chat#1912 row 2).
 * Authentication is the gate, not the presence of account data, so a session
 * that has just been torn down reads as signed-out immediately.
 */
export function getUserProfileState({
  isPrivyReady,
  isAuthenticated,
  hasUserData,
}: UserProfileStateInput): UserProfileState {
  if (!isPrivyReady) return "loading";
  if (!isAuthenticated) return "signed-out";
  return hasUserData ? "ready" : "loading";
}
