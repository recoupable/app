import type { UpgradePlan } from "@/lib/upgrade/types";

export type PlanId = "free" | UpgradePlan;

/** A cell is literal text, a check mark, or a dash. */
export type PlanCell = string;

export interface PlanColumn {
  id: PlanId;
  name: string;
  price: string;
}

export interface PlanTableRow {
  label: string;
  /** Under 640px the label column is narrow. */
  mobileLabel: string;
  cells: [PlanCell, PlanCell, PlanCell];
}

/** The three plans, in table order. Copy approved on the design canvas. */
export const PLAN_COLUMNS: PlanColumn[] = [
  { id: "free", name: "Free", price: "$0" },
  { id: "starter", name: "Starter", price: "$19/mo" },
  { id: "pro", name: "Pro", price: "$99/mo, 3x credits" },
];

/** Comparison rows, in the approved order; shared rows first. */
export const PLAN_TABLE_ROWS: PlanTableRow[] = [
  { label: "Agent credits every month", mobileLabel: "Credits a month", cells: ["$3.33", "$20", "$300"] },
  { label: "Report runs that buys", mobileLabel: "Report runs", cells: ["~4", "~26", "~391"] },
  { label: "Scheduled tasks", mobileLabel: "Tasks", cells: ["1", "3", "Unlimited"] },
  { label: "Fastest cadence", mobileLabel: "Fastest cadence", cells: ["Weekly", "Daily", "Hourly"] },
  { label: "Reports emailed to", mobileLabel: "Reports emailed to", cells: ["You", "You", "Anyone"] },
  { label: "API keys", mobileLabel: "API keys", cells: ["check", "check", "check"] },
  { label: "Daily social monitoring", mobileLabel: "Social monitoring", cells: ["dash", "dash", "check"] },
  { label: "Card required", mobileLabel: "Card required", cells: ["No", "Yes", "Yes"] },
];
