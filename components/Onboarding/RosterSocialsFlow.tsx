"use client";

import { useState } from "react";
import ConfirmRosterStep from "./ConfirmRosterStep";
import RosterVerifiedPanel from "./RosterVerifiedPanel";
import SetupProgress from "./SetupProgress";
import SetupSkipLink from "./SetupSkipLink";
import VerifySocialsStep from "./VerifySocialsStep";

type FlowStep = "roster" | "socials" | "done";

/**
 * Container for the roster + socials steps of the canonical `/setup/*`
 * sequence (chat#1889), mounted by `/setup/artists` and `/setup/socials`.
 *
 * `initialStep` lets a deep link open the flow directly at a given step (e.g.
 * the welcome email's "verify socials" link → `/setup/socials`).
 *
 * Carries the gate's "skip for now" escape hatch: home forwards incomplete
 * accounts here, so without it the soft gate would become a wall.
 */
const RosterSocialsFlow = ({
  initialStep = "roster",
}: {
  initialStep?: "roster" | "socials";
} = {}) => {
  const [step, setStep] = useState<FlowStep>(initialStep);

  return (
    <div className="w-full max-w-xl mx-auto grow py-8 px-6 flex flex-col gap-6">
      {step !== "done" && (
        <SetupProgress step={step === "roster" ? "artists" : "socials"} />
      )}
      {step === "roster" && (
        <ConfirmRosterStep onConfirmed={() => setStep("socials")} />
      )}
      {step === "socials" && (
        <VerifySocialsStep onConfirmed={() => setStep("done")} />
      )}
      {step === "done" && <RosterVerifiedPanel />}
      {step !== "done" && <SetupSkipLink />}
    </div>
  );
};

export default RosterSocialsFlow;
