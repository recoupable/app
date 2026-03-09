/**
 * Checks if a cron expression represents a recurring schedule (daily, weekly, or monthly)
 */
export const isRecurring = (cronExpression: string | null | undefined): boolean => {
  try {
    if (!cronExpression) return false;
    const parts = cronExpression.split(" ");
    if (parts.length >= 5) {
      const dayOfMonth = parts[2];
      const month = parts[3];
      const dayOfWeek = parts[4];

      // Daily recurring
      if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
        return true;
      }

      // Weekly recurring
      if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
        return true;
      }

      // Monthly recurring
      if (dayOfMonth !== "*" && month === "*" && dayOfWeek === "*") {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};
