"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import NewChatBootstrap from "../VercelChat/NewChatBootstrap";
import OnboardingChecklist from "@/components/Onboarding/OnboardingChecklist";
import OnboardingSequence from "@/components/Onboarding/OnboardingSequence";
import { useOnboardingGate } from "@/hooks/useOnboardingGate";
import { useEffect } from "react";
import { UIMessage } from "ai";

const HomePage = ({ initialMessages }: { initialMessages?: UIMessage[] }) => {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const onboarding = useOnboardingGate();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Incomplete accounts resume the sequence at their derived step on every
  // landing; skip drops to the app with the checklist pinned as a persistent
  // reminder; activated accounts only ever see the normal home
  // (recoupable/chat#1867).
  if (onboarding.view === "sequence" && onboarding.step !== "complete") {
    return (
      <div className="flex flex-col size-full items-center">
        <OnboardingSequence
          step={onboarding.step}
          checkpoints={onboarding.checkpoints}
          onSkip={onboarding.skip}
        />
      </div>
    );
  }

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
