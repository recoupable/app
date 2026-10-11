"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import NewChatBootstrap from "../VercelChat/NewChatBootstrap";
import OnboardingChecklist from "@/components/Onboarding/OnboardingChecklist";
import { useOnboardingGate } from "@/hooks/useOnboardingGate";
import useCheckoutIntent from "@/hooks/useCheckoutIntent";
import { useEffect } from "react";
import { UIMessage } from "ai";

const HomePage = ({ initialMessages }: { initialMessages?: UIMessage[] }) => {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const router = useRouter();
  const onboarding = useOnboardingGate();
  useCheckoutIntent();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // One canonical onboarding surface (chat#1889): an incomplete account is
  // forwarded into `/setup`, which opens at its derived step. Home used to host
  // a second, card-based sequence that only linked out to the generic app pages,
  // so a direct signup never saw the interactive steps the welcome email's
  // `/setup/*` links reach. Skip still drops to the app with the checklist
  // pinned (the gate stays soft — see SetupSkipLink).
  const shouldEnterSetup =
    onboarding.view === "sequence" && onboarding.step !== "complete";

  useEffect(() => {
    if (shouldEnterSetup) {
      router.replace("/setup");
    }
  }, [shouldEnterSetup, router]);

  return (
    <div className="relative flex flex-col size-full items-center">
      <NewChatBootstrap initialMessages={initialMessages} />
      {onboarding.view === "checklist" && (
        <OnboardingChecklist
          checkpoints={onboarding.checkpoints}
          onResume={onboarding.resume}
        />
      )}
    </div>
  );
};

export default HomePage;
