/** Recipe-local synthetic descriptors, not a new Context wire or authority contract. */
export type CatalogExplorerRecord = Readonly<{
  id: string;
  label: string;
  kind: "recording";
  cohort: string;
  sourceVersion: string;
  role: "observed" | "hypothetical";
  metric: string;
  unit: string | null;
  currency: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  territory: string;
  observedAt: string;
  value:
    | { state: "known"; amount: number }
    | { state: "unknown" | "withheld" | "not-applicable" };
}>;
export const catalogCohorts = {
  luminate: "Luminate period streams",
  spotify: "Spotify cumulative observations",
  browser: "Browser activity",
  estimate: "Hypothetical value",
  cash: "Realized cash",
} as const;
