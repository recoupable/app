import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder blocks in the page's shape while the four queries load. */
const BillingSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-4 md:flex-row">
      <Skeleton className="h-44 flex-1 rounded-2xl" />
      <Skeleton className="h-44 flex-1 rounded-2xl" />
    </div>
    <Skeleton className="h-52 rounded-2xl" />
    <Skeleton className="h-40 rounded-2xl" />
  </div>
);

export default BillingSkeleton;
