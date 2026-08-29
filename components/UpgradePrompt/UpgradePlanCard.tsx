import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UPGRADE_PLAN_CARDS } from "@/lib/upgrade/upgradePlanCards";
import type { UpgradePlan } from "@/lib/upgrade/types";

interface UpgradePlanCardProps {
  plan: UpgradePlan;
  onChoose: (plan: UpgradePlan) => void;
}

/** One plan inside the prompt: price, what it includes, the button, the disclosure. */
const UpgradePlanCard = ({ plan, onChoose }: UpgradePlanCardProps) => {
  const card = UPGRADE_PLAN_CARDS[plan];
  const highlighted = plan === "pro";
  return (
    <div
      className={`flex flex-col rounded-xl p-4 shadow-[0_0_0_1px_var(--border)] ${
        highlighted ? "bg-foreground text-background" : "bg-background text-foreground"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">{card.name}</p>
        <p className="text-sm">{card.price}</p>
      </div>
      <ul className="mt-3 flex-1 space-y-1.5 text-xs">
        {card.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        size="sm"
        variant={highlighted ? "secondary" : "default"}
        className="mt-4 w-full"
        onClick={() => onChoose(plan)}
      >
        {card.cta}
      </Button>
      <p className={`mt-2 text-[11px] ${highlighted ? "text-background/70" : "text-muted-foreground"}`}>
        {card.note}
      </p>
    </div>
  );
};

export default UpgradePlanCard;
