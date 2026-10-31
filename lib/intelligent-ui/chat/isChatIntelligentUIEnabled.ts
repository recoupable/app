/** Local opt-in only. A production build cannot enable this experimental consumer. */
export function isChatIntelligentUIEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_VERCEL_ENV !== "production" &&
    process.env.VERCEL_ENV !== "production" &&
    process.env.NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT === "true"
  );
}
