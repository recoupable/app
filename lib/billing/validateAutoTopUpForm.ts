/** Client-side mirror of the api's rules; returns the message to show, or null when valid. */
const validateAutoTopUpForm = (
  amount: string,
  threshold: string,
): string | null => {
  const a = Number(amount.trim());
  const t = Number(threshold.trim());
  if (amount.trim() === "" || Number.isNaN(a))
    return "Enter a top-up amount in dollars.";
  if (a < 5 || a > 1000)
    return "The top-up amount must be between $5.00 and $1,000.00.";
  if (threshold.trim() === "" || Number.isNaN(t))
    return "Enter the balance that triggers a top-up.";
  if (t < 0) return "The threshold cannot be negative.";
  if (t >= a) return "The threshold must be below the top-up amount.";
  return null;
};

export default validateAutoTopUpForm;
