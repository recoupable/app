import { Skeleton } from "@/components/ui/skeleton";

export default function FilePreviewSkeleton() {
  return (
    <div className="flex-1 border border-border rounded-lg bg-background overflow-hidden p-6 sm:p-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
