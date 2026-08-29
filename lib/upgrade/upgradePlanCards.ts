import type { UpgradePlan } from "@/lib/upgrade/types";

export interface UpgradePlanCard {
  name: string;
  price: string;
  features: string[];
  cta: string;
  /** The disclosure under the button, identical to /pricing. */
  note: string;
}

/** Plan cards the prompt shows, with the same disclosures as /pricing. */
export const UPGRADE_PLAN_CARDS: Record<UpgradePlan, UpgradePlanCard> = {
  starter: {
    name: "Starter",
    price: "$19/mo",
    features: ["$20 in agent credits every month", "Up to 3 tasks, daily at the fastest"],
    cta: "Start Starter",
    note: "$19 today. Cancel anytime.",
  },
  pro: {
    name: "Pro",
    price: "$99/mo",
    features: [
      "$300 in agent credits every month",
      "Unlimited tasks, hourly at the fastest",
      "Daily social monitoring for your whole roster",
      "Reports emailed to anyone you choose",
    ],
    cta: "Start 30-day trial",
    note: "$0 today. Card required, cancel anytime before day 30.",
  },
};
