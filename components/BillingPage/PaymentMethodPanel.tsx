import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import BillingPanel from "./BillingPanel";
import RemoveCardButton from "./RemoveCardButton";
import type { SavedCard } from "@/lib/recoup/getAccountPaymentMethod";

const brandLabel = (brand: string) =>
  brand.charAt(0).toUpperCase() + brand.slice(1);

/** The default card with Replace / Remove, or the Configure billing empty state. */
const PaymentMethodPanel = ({
  card,
  onConfigure,
  onRemove,
  isBusy,
  onSwitchToPersonal,
}: {
  card: SavedCard | null;
  onConfigure: () => void;
  onRemove: () => void;
  isBusy: boolean;
  /** Present when an organization is selected; returns the page to personal billing. */
  onSwitchToPersonal?: () => void;
}) => (
  <BillingPanel title="Payment method">
    {card ? (
      <>
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-10 items-center justify-center rounded-md bg-muted">
            <CreditCard className="size-[18px]" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              {brandLabel(card.brand)} ending in {card.last4}
            </span>
            <span className="text-[13px] text-muted-foreground">
              Expires {String(card.exp_month).padStart(2, "0")}/{card.exp_year}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onConfigure}
            disabled={isBusy}
          >
            Replace card
          </Button>
          <RemoveCardButton onRemove={onRemove} disabled={isBusy} />
        </div>
      </>
    ) : (
      <>
        <p className="text-sm leading-relaxed text-muted-foreground">
          No payment method on file. Add a card to buy credits and pay for a
          plan.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onConfigure} disabled={isBusy}>
            Configure billing
          </Button>
          {onSwitchToPersonal && (
            <button
              type="button"
              onClick={onSwitchToPersonal}
              className="text-xs text-muted-foreground underline underline-offset-[3px] hover:text-foreground"
            >
              Switch to personal billing
            </button>
          )}
        </div>
      </>
    )}
  </BillingPanel>
);

export default PaymentMethodPanel;
