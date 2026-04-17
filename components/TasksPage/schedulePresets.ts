export const CUSTOM_SCHEDULE_OPTION = "__custom__";

export const SCHEDULE_PRESETS = [
  { id: "daily-0900", label: "Daily at 09:00 UTC", cron: "0 9 * * *" },
  { id: "daily-1700", label: "Daily at 17:00 UTC", cron: "0 17 * * *" },
  { id: "weekdays-0900", label: "Weekdays at 09:00 UTC", cron: "0 9 * * 1-5" },
  { id: "weekly-mon-0900", label: "Every Monday at 09:00 UTC", cron: "0 9 * * 1" },
] as const;
