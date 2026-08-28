import { Skeleton } from "@/components/ui/skeleton";

const AgentsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 xl:gap-8 pr-1 md:pr-2 py-2 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="group relative overflow-hidden rounded-xl border bg-card w-full"
        >
          {/* Header area matches CardHeader p-4 pb-2 */}
          <div className="p-4 pb-2">
            <div className="space-y-3">
              <Skeleton className="h-5 w-28 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
          {/* Content area matches CardContent px-4 pt-0 pb-3 */}
          <div className="px-4 pt-0 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentsSkeleton;
