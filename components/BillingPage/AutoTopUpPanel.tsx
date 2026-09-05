import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import BillingPanel from "./BillingPanel";
import MoneyInput from "./MoneyInput";
import type { AutoTopUpSettings } from "@/lib/recoup/getAccountAutoTopUp";
import type { AutoTopUpInput } from "@/lib/billing/updateClientAutoTopUp";
import validateAutoTopUpForm from "@/lib/billing/validateAutoTopUpForm";

const toDollars = (cents: number | null, fallback: string) =>
  cents === null ? fallback : (cents / 100).toFixed(2);
const toCents = (dollars: string) => Math.round(Number(dollars) * 100);

/** Toggle, amount, threshold and Save; disabled with a hint until a card is on file. */
const AutoTopUpPanel = ({
  settings,
  hasCard,
  balanceUsd,
  onSave,
  isSaving,
  error,
}: {
  settings: AutoTopUpSettings;
  hasCard: boolean;
  balanceUsd: string;
  onSave: (input: AutoTopUpInput) => void;
  isSaving: boolean;
  error: string | null;
}) => {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [amount, setAmount] = useState(
    toDollars(settings.amountCents, "50.00"),
  );
  const [threshold, setThreshold] = useState(
    toDollars(settings.thresholdCents, "5.00"),
  );
  const fieldsDisabled = !hasCard || !enabled;
  const invalid = hasCard ? validateAutoTopUpForm(amount, threshold) : null;

  const hint = !hasCard
    ? "Add a card first. Auto top-up charges the card on file when your balance runs low."
    : enabled
      ? `Charges the card on file automatically. Current balance ${balanceUsd}.`
      : `Off. Turn on to charge the card on file when your balance runs low. Current balance ${balanceUsd}.`;

  return (
    <BillingPanel
      title="Auto top-up"
      aside={
        <Switch
          checked={hasCard && enabled}
          onCheckedChange={setEnabled}
          disabled={!hasCard || isSaving}
          aria-label="Auto top-up"
        />
      }
    >
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {hint}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <MoneyInput
          id="auto-top-up-amount"
          label="Top up by"
          value={amount}
          onChange={setAmount}
          disabled={fieldsDisabled}
        />
        <MoneyInput
          id="auto-top-up-threshold"
          label="When balance drops below"
          value={threshold}
          onChange={setThreshold}
          disabled={fieldsDisabled}
        />
      </div>
      {invalid && <p className="text-[13px] text-destructive">{invalid}</p>}
      {error && (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      )}
      {hasCard && (
        <div>
          <Button
            variant="outline"
            size="sm"
            disabled={isSaving || invalid !== null}
            onClick={() =>
              onSave({
                enabled,
                amountCents: toCents(amount),
                thresholdCents: toCents(threshold),
              })
            }
          >
            Save
          </Button>
        </div>
      )}
    </BillingPanel>
  );
};

export default AutoTopUpPanel;
