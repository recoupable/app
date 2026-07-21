import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the catalog report: valuation card, stat row, table.
 */
const CatalogReportSkeleton = () => {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Loading catalog report"
    >
      <div className="rounded-2xl p-6 sm:p-8 shadow-[0_0_0_1px_var(--border)]">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-4 h-14 w-48" />
        <Skeleton className="mt-3 h-4 w-32" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
};

export default CatalogReportSkeleton;
