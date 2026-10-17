/** Only local development or an explicitly enabled preview may serve fixtures. */
export function isPlaygroundEnabled(): boolean {
  if (process.env.VERCEL_ENV === "production") return false;

  return (
    process.env.NODE_ENV === "development" ||
    (process.env.NODE_ENV === "production" &&
      process.env.VERCEL_ENV === "preview" &&
      process.env.RECOUP_INTELLIGENT_UI_PLAYGROUND === "true")
  );
}
