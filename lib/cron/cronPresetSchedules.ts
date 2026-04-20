/**
 * Single source of truth for quick cron presets (shared by CronEditor presets and any other UI).
 * Labels match the casual AM/PM wording used in the task editor.
 */
export type CronSimplePreset = {
  id: string;
  label: string;
  /** Five-part cron expression */
  cron: string;
  icon: string;
};

export const CRON_SIMPLE_PRESETS: CronSimplePreset[] = [
  { id: "every-day-9", label: "Every day at 9:00 AM", cron: "0 9 * * *", icon: "☀️" },
  {
    id: "every-weekday-9",
    label: "Every weekday at 9:00 AM",
    cron: "0 9 * * 1-5",
    icon: "💼",
  },
  { id: "every-monday-9", label: "Every Monday at 9:00 AM", cron: "0 9 * * 1", icon: "📅" },
  { id: "every-hour", label: "Every hour", cron: "0 * * * *", icon: "⏰" },
  { id: "every-day-noon", label: "Every day at noon", cron: "0 12 * * *", icon: "🌞" },
  { id: "every-day-5pm", label: "Every day at 5:00 PM", cron: "0 17 * * *", icon: "🕔" },
  { id: "every-day-6pm", label: "Every day at 6:00 PM", cron: "0 18 * * *", icon: "🌆" },
  {
    id: "monthly-first-9",
    label: "First day of every month",
    cron: "0 9 1 * *",
    icon: "📆",
  },
];
