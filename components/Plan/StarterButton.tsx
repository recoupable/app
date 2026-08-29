import { Button } from "@/components/ui/button";
import type { UpgradePlan } from "@/lib/upgrade/types";

/** The Starter buy button; the caller sets the height for its layout. */
const StarterButton = ({ onStartCheckout, className }: { onStartCheckout: (plan: UpgradePlan) => void; className: string }) => (
  <Button type="button" variant="outline" className={className} onClick={() => onStartCheckout("starter")}>
    Start Starter
  </Button>
);

export default StarterButton;
