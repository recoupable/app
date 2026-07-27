"use client";

import { useRouter } from "next/navigation";
import { useOnboardingSessionFlags } from "@/hooks/useOnboardingSessionFlags";
import { useUserProvider } from "@/providers/UserProvder";

/**
 * The onboarding gate's escape hatch, on the `/setup/*` surface (chat#1889).
 *
 * Home now forwards an incomplete account into `/setup`, so skip has to live
 * here or the soft gate becomes a wall. Setting the session flag makes
 * `getOnboardingView` return "checklist", so home renders the app with the
 * checklist pinned instead of forwarding again.
 */
const SetupSkipLink = () => {
  const router = useRouter();
  const { userData } = useUserProvider();
  const { skip } = useOnboardingSessionFlags(userData?.account_id ?? "");

  const handleSkip = () => {
    skip();
    router.push("/");
  };

  return (
    <button
      type="button"
      onClick={handleSkip}
      className="self-start text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
    >
      Skip for now
    </button>
  );
};

export default SetupSkipLink;
