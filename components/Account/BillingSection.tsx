import { Switch } from "@/components/ui/switch";
import useAutoRecharge from "@/hooks/useAutoRecharge";

/**
 * Billing section of the account modal. Unlike the form fields above it, the
 * auto top-up switch applies immediately (PATCH on flip) — it is not governed
 * by the form's Save button, so it sits in its own divided section.
 */
const BillingSection = () => {
  const { enabled, isLoading, isUpdating, setEnabled } = useAutoRecharge();

  return (
    <div className="w-full border-t border-border pt-4 mb-6">
      <p className="text-sm font-medium text-foreground mb-3">Billing</p>
      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor="auto-topup" className="text-sm text-foreground">
            Automatic top-up
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            When your credits run out, automatically charge your saved card $5
            for 500 credits. Turning this off never removes your card — you can
            still top up manually anytime.
          </p>
        </div>
        <Switch
          id="auto-topup"
          checked={enabled}
          disabled={isLoading || isUpdating}
          onCheckedChange={setEnabled}
          className="mt-0.5"
        />
      </div>
    </div>
  );
};

export default BillingSection;
