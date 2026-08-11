import cronstrue from "cronstrue";

export const parseCronToHuman = (cronExpression: string | null | undefined): string => {
  try {
    if (!cronExpression) return "No schedule";
    return cronstrue.toString(cronExpression);
  } catch (e) {
    console.error(`Error parsing cron expression: ${cronExpression}`, e);
    return cronExpression;
  }
};

