import type {
  UseInfiniteQueryResult,
  InfiniteData,
} from "@tanstack/react-query";
import UsageLoadMore from "@/components/UsagePage/UsageLoadMore";
import PaymentsTable from "./PaymentsTable";
import type { AccountPaymentsPage } from "@/lib/recoup/getAccountPayments";

/** The Payments heading, table, and the load-more control for the paged invoice list. */
const PaymentsSection = ({
  payments,
}: {
  payments: UseInfiniteQueryResult<InfiniteData<AccountPaymentsPage>>;
}) => (
  <>
    <h2 className="mb-3 mt-6 font-heading text-base font-semibold tracking-tight">
      Payments
    </h2>
    <PaymentsTable
      payments={payments.data?.pages.flatMap((page) => page.payments) ?? []}
    />
    {payments.hasNextPage && (
      <UsageLoadMore
        onClick={() => payments.fetchNextPage()}
        isLoading={payments.isFetchingNextPage}
      />
    )}
  </>
);

export default PaymentsSection;
