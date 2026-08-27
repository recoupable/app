"use client";

import useAccountUsage from "@/hooks/useAccountUsage";
import isForbiddenError from "@/lib/usage/isForbiddenError";
import UsagePageHeader from "./UsagePageHeader";
import UsagePeriodSummary from "./UsagePeriodSummary";
import UsageTable from "./UsageTable";
import UsageEmptyState from "./UsageEmptyState";
import UsageNoAccess from "./UsageNoAccess";
import UsageSkeleton from "./UsageSkeleton";
import UsageLoadMore from "./UsageLoadMore";

const UsagePage = () => {
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAccountUsage();
  const first = data?.pages[0];
  const events = data?.pages.flatMap((page) => page.events) ?? [];

  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <UsagePageHeader />
      {isLoading && <UsageSkeleton />}
      {!isLoading && isForbiddenError(error) && <UsageNoAccess />}
      {!isLoading && error && !isForbiddenError(error) && (
        <p className="text-sm text-muted-foreground">
          Usage could not be loaded. Try again in a moment.
        </p>
      )}
      {first && (
        <>
          <UsagePeriodSummary
            period={first.period}
            totalUsd={first.total_usd}
          />
          {events.length === 0 ? (
            <UsageEmptyState />
          ) : (
            <UsageTable events={events} />
          )}
          {hasNextPage && (
            <UsageLoadMore
              onClick={() => fetchNextPage()}
              isLoading={isFetchingNextPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default UsagePage;
