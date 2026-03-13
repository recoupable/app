import cronstrue from "cronstrue";

export const parseCronToHuman = (cronExpression: string): string => {
  try {
    return cronstrue.toString(cronExpression);
  } catch (e) {
    console.error(`Error parsing cron expression: ${cronExpression}`, e);
    return cronExpression;
  }
};
