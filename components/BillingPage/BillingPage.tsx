"use client";

import PageContainer from "@/components/TasksPage/PageContainer";
import { useUserProvider } from "@/providers/UserProvder";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import usePaymentMethod from "@/hooks/usePaymentMethod";
import useSubscription from "@/hooks/useSubscription";
import usePayments from "@/hooks/usePayments";
import useAutoTopUp from "@/hooks/useAutoTopUp";
import useBillingMutations from "@/hooks/useBillingMutations";
import { formatCreditsAsUsd } from "@/lib/credits/formatCreditsAsUsd";
import BillingPageHeader from "./BillingPageHeader";
import BillingSkeleton from "./BillingSkeleton";
import PaymentMethodPanel from "./PaymentMethodPanel";
import PlanPanel from "./PlanPanel";
import AutoTopUpPanel from "./AutoTopUpPanel";
import PaymentsTable from "./PaymentsTable";
import UsageLoadMore from "@/components/UsagePage/UsageLoadMore";

const NO_AUTO_TOP_UP = {
  enabled: false,
  amountCents: null,
  thresholdCents: null,
  lastRunAt: null,
  lastError: null,
};

/** The signed-in account's card, plan, auto top-up settings and payments. */
const BillingPage = () => {
  const { userData } = useUserProvider();
  const { credits } = usePaymentProvider();
  const accountId = userData?.account_id as string | undefined;

  const paymentMethod = usePaymentMethod(accountId);
  const subscription = useSubscription(accountId);
  const payments = usePayments(accountId);
  const autoTopUp = useAutoTopUp(accountId);
  const actions = useBillingMutations(accountId);

  // The auto top-up read is in the gate so the panel never shows Off defaults while it loads.
  const isLoading =
    paymentMethod.isLoading ||
    subscription.isLoading ||
    payments.isLoading ||
    autoTopUp.isLoading;
  const failed = paymentMethod.error || subscription.error || payments.error;
  const card = paymentMethod.data?.card ?? null;
  const rows = payments.data?.pages.flatMap((page) => page.payments) ?? [];

  return (
    <PageContainer className="max-w-4xl py-8">
      <BillingPageHeader scope="your account" />
      {isLoading && <BillingSkeleton />}
      {!isLoading && failed && (
        <p className="text-sm text-muted-foreground">
          Billing could not be loaded. Try again in a moment.
        </p>
      )}
      {!isLoading &&
        paymentMethod.data &&
        subscription.data &&
        payments.data && (
          <>
            <div className="mb-4 flex flex-col gap-4 md:flex-row">
              <PaymentMethodPanel
                card={card}
                onConfigure={actions.configureCard}
                onRemove={() => actions.removeCard.mutate()}
                isBusy={actions.removeCard.isPending}
              />
              <PlanPanel
                subscription={subscription.data}
                onUpgrade={actions.upgrade}
                onManage={actions.manageBilling}
              />
            </div>
            <div className="mb-4">
              <AutoTopUpPanel
                key={`${card?.last4 ?? "none"}-${autoTopUp.data?.enabled ?? "unset"}`}
                settings={
                  autoTopUp.data ?? {
                    account_id: accountId as string,
                    ...NO_AUTO_TOP_UP,
                  }
                }
                hasCard={!!card && !autoTopUp.isError}
                balanceUsd={formatCreditsAsUsd(credits)}
                onSave={(input) => actions.saveAutoTopUp.mutate(input)}
                isSaving={actions.saveAutoTopUp.isPending}
                error={
                  actions.saveAutoTopUp.error?.message ??
                  autoTopUp.data?.lastError ??
                  null
                }
              />
            </div>
            <h2 className="mb-3 mt-6 font-heading text-base font-semibold tracking-tight">
              Payments
            </h2>
            <PaymentsTable payments={rows} />
            {payments.hasNextPage && (
              <UsageLoadMore
                onClick={() => payments.fetchNextPage()}
                isLoading={payments.isFetchingNextPage}
              />
            )}
          </>
        )}
    </PageContainer>
  );
};

export default BillingPage;
