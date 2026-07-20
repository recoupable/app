"use client";

import { useState } from "react";
import ConfirmRosterStep from "./ConfirmRosterStep";
import RosterVerifiedPanel from "./RosterVerifiedPanel";
import VerifySocialsStep from "./VerifySocialsStep";

type FlowStep = "roster" | "socials" | "done";

/**
 * Standalone container for the roster + socials onboarding steps so the
 * slice is user-testable at /onboarding/roster today. The sibling
 * onboarding-sequence router (chat#1867) mounts `ConfirmRosterStep` and
 * `VerifySocialsStep` directly with its own state-derived stepping.
 */
const RosterSocialsFlow = () => {
  const [step, setStep] = useState<FlowStep>("roster");

  return (
    <div className="w-full max-w-xl mx-auto grow py-8 px-6">
      {step !== "done" && (
        <p className="text-xs text-muted-foreground mb-6">
          Step {step === "roster" ? "1" : "2"} of 2
        </p>
      )}
      {step === "roster" && (
        <ConfirmRosterStep onConfirmed={() => setStep("socials")} />
      )}
      {step === "socials" && (
        <VerifySocialsStep onConfirmed={() => setStep("done")} />
      )}
      {step === "done" && <RosterVerifiedPanel />}
    </div>
  );
};

export default RosterSocialsFlow;
