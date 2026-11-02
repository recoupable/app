/** Date-only Gregorian arithmetic. UTC fields are a calendar carrier, never a local instant. */
export function calendarDate(value: string, offsetDays = 0): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isInteger(offsetDays))
    return null;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900 || year > 2100) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.toISOString().slice(0, 10) !== value) return null;
  date.setUTCDate(date.getUTCDate() + offsetDays);
  if (date.getUTCFullYear() < 1900 || date.getUTCFullYear() > 2100) return null;
  return date.toISOString().slice(0, 10);
}
