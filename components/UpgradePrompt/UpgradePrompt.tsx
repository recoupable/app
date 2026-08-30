"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import UpgradeMeter from "@/components/UpgradePrompt/UpgradeMeter";
import { trackUpgradePromptShown } from "@/lib/upgrade/trackUpgradePromptShown";
import type { UpgradeCopy, UpgradeTrigger } from "@/lib/upgrade/types";

export interface UpgradePromptProps {
  trigger: UpgradeTrigger;
  copy: UpgradeCopy;
  onUpgrade: (trigger: UpgradeTrigger) => void;
  onDismiss: () => void;
  /** Lets a modal host render the headline as its accessible dialog title. */
  renderTitle?: (headline: string) => ReactNode;
  /** Lets a modal host render the sentence as its accessible dialog description. */
  renderBody?: (body: string) => ReactNode;
}

/**
 * The one upgrade prompt: the number that opened it, a meter, one sentence,
 * one Upgrade button, and a quiet way to stay on Free. Tracks
 * `upgrade_prompt_shown` per distinct trigger; the caller decides where it
 * renders (inline card or modal) and where Upgrade goes.
 */
const UpgradePrompt = ({ trigger, copy, onUpgrade, onDismiss, renderTitle, renderBody }: UpgradePromptProps) => {
  const lastShown = useRef<UpgradeTrigger | null>(null);
  useEffect(() => {
    if (lastShown.current === trigger) return;
    lastShown.current = trigger;
    trackUpgradePromptShown({ trigger });
  }, [trigger]);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          {renderTitle ? (
            renderTitle(copy.headline)
          ) : (
            <h2 className="text-[28px] font-semibold leading-8 tracking-[-0.02em] sm:text-[32px] sm:leading-9">
              {copy.headline}
            </h2>
          )}
          <p className="text-right text-xs text-muted-foreground sm:text-[13px]">{copy.sub}</p>
        </div>
        <UpgradeMeter ratio={copy.ratio} label={copy.sub} />
        {renderBody ? renderBody(copy.body) : <p className="text-sm text-muted-foreground">{copy.body}</p>}
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Button type="button" className="h-11 w-full sm:h-9" onClick={() => onUpgrade(trigger)}>
          Upgrade
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Keep Free
        </button>
      </div>
    </section>
  );
};

export default UpgradePrompt;
