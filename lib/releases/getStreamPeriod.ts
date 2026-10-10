/** End on the collection's two-day reporting buffer, using UTC dates throughout. */
export function getStreamPeriod(
  days: number,
  now = new Date(),
  since?: string | null,
) {
  if (since) return { days, since };
  const day = 86400000;
  const today = Date.parse(`${now.toISOString().slice(0, 10)}T00:00:00Z`);
  const end = today - day;
  return { days, since: new Date(end - days * day).toISOString().slice(0, 10) };
}
