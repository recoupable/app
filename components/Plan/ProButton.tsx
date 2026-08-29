import { Button } from "@/components/ui/button";
import type { UpgradePlan } from "@/lib/upgrade/types";

/** The Pro trial button; the caller sets the height for its layout. */
const ProButton = ({ onStartCheckout, className }: { onStartCheckout: (plan: UpgradePlan) => void; className: string }) => (
  <Button type="button" className={className} onClick={() => onStartCheckout("pro")}>
    Start 30-day trial
  </Button>
);

export default ProButton;
