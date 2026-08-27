"use client";

import { useState } from "react";
import useAccountUsage from "@/hooks/useAccountUsage";
import { DEFAULT_USAGE_SORT, type UsageSort } from "@/lib/usage/usageSort";
import { DEFAULT_USAGE_RANGE, type UsageRange } from "@/lib/usage/usageRanges";
import UsageRangeSelector from "./UsageRangeSelector";
import UsageChart from "./UsageChart";
import isForbiddenError from "@/lib/usage/isForbiddenError";
import UsagePageHeader from "./UsagePageHeader";
import UsagePeriodSummary from "./UsagePeriodSummary";
import UsageTable from "./UsageTable";
import UsageEmptyState from "./UsageEmptyState";
import UsageNoAccess from "./UsageNoAccess";
import UsageSkeleton from "./UsageSkeleton";
import UsageLoadMore from "./UsageLoadMore";

const UsagePage = () => {
  const [sort, setSort] = useState<UsageSort>(DEFAULT_USAGE_SORT);
  const [range, setRange] = useState<UsageRange>(DEFAULT_USAGE_RANGE);
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAccountUsage({ range, sort });
  const first = data?.pages[0];
  const events = data?.pages.flatMap((page) => page.events) ?? [];

  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <UsagePageHeader />
      <div className="mb-4">
        <UsageRangeSelector value={range} onChange={setRange} />
      </div>
      {isLoading && <UsageSkeleton />}
      {!isLoading && isForbiddenError(error) && <UsageNoAccess />}
      {!isLoading && error && !isForbiddenError(error) && (
        <p className="text-sm text-muted-foreground">
          Usage could not be loaded. Try again in a moment.
        </p>
      )}
      {first && (
        <>
          {first.series && first.series_bucket && (
            <UsageChart
              series={first.series}
              bucket={first.series_bucket}
              period={first.period}
            />
          )}
          <UsagePeriodSummary
            period={first.period}
            totalUsd={first.total_usd}
          />
          {events.length === 0 ? (
            <UsageEmptyState />
          ) : (
            <UsageTable events={events} sort={sort} onSortChange={setSort} />
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
