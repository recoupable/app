interface CatalogReportErrorProps {
  error: Error | null;
}

/**
 * Report-tab failure state (measurements unavailable): explains what happened
 * without killing the page — the Manage songs tab stays reachable.
 */
const CatalogReportError = ({ error }: CatalogReportErrorProps) => {
  const notFound = error?.message?.includes("404");

  return (
    <div className="max-w-3xl rounded-2xl bg-card p-6 sm:p-8 shadow-[0_0_0_1px_var(--border)]">
      <h2 className="font-heading text-sm font-bold text-foreground">
        {notFound
          ? "No valuation found for this catalog"
          : "Couldn't load this report"}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {notFound
          ? "This catalog has no measured play counts linked to your account yet. Run a valuation from recoupable.dev, or add songs in the Manage songs tab and ask Recoup to measure them."
          : "Something went wrong loading the measurements. Refresh to try again; your songs are still available in the Manage songs tab."}
      </p>
    </div>
  );
};

export default CatalogReportError;
