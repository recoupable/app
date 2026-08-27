/** The spans the usage page can show; the api period is derived from one of these. */
export const USAGE_RANGES = ["24h", "7d", "30d", "3m", "12m", "24m"] as const;

export type UsageRange = (typeof USAGE_RANGES)[number];

export const DEFAULT_USAGE_RANGE: UsageRange = "30d";
