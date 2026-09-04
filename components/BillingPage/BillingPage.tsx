"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import PageContainer from "@/components/TasksPage/PageContainer";
import { useUserProvider } from "@/providers/UserProvder";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import usePaymentMethod from "@/hooks/usePaymentMethod";
import useSubscription from "@/hooks/useSubscription";
import usePayments from "@/hooks/usePayments";
import useAutoTopUp from "@/hooks/useAutoTopUp";
import createClientPaymentMethodSession from "@/lib/billing/createClientPaymentMethodSession";
import deleteClientPaymentMethod from "@/lib/billing/deleteClientPaymentMethod";
import updateClientAutoTopUp, { AutoTopUpInput } from "@/lib/billing/updateClientAutoTopUp";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";
import createClientPortalSession from "@/lib/stripe/createClientPortalSession";
import { formatCreditsAsUsd } from "@/lib/credits/formatCreditsAsUsd";
import BillingPageHeader from "./BillingPageHeader";
import BillingSkeleton from "./BillingSkeleton";
import PaymentMethodPanel from "./PaymentMethodPanel";
import PlanPanel from "./PlanPanel";
import AutoTopUpPanel from "./AutoTopUpPanel";
import PaymentsTable from "./PaymentsTable";
import UsageLoadMore from "@/components/UsagePage/UsageLoadMore";

const NO_AUTO_TOP_UP = { enabled: false, amountCents: null, thresholdCents: null, lastRunAt: null, lastError: null };

/** The signed-in account's card, plan, auto top-up settings and payments. */
const BillingPage = () => {
  const { userData } = useUserProvider();
  const { getAccessToken } = usePrivy();
  const { credits } = usePaymentProvider();
  const queryClient = useQueryClient();
  const accountId = userData?.account_id as string | undefined;

  const paymentMethod = usePaymentMethod(accountId);
  const subscription = useSubscription(accountId);
  const payments = usePayments(accountId);
  const autoTopUp = useAutoTopUp(accountId);

  const withToken = async <T,>(fn: (token: string) => Promise<T>) => {
    const token = await getAccessToken();
    if (!token || !accountId) throw new Error("Please sign in");
    return fn(token);
  };
  const invalidate = (key: string) => queryClient.invalidateQueries({ queryKey: [key, accountId] });

  const removeCard = useMutation({
    mutationFn: () => withToken((token) => deleteClientPaymentMethod(accountId as string, token)),
    onSuccess: () => {
      invalidate("paymentMethod");
      invalidate("autoTopUp");
    },
  });
  const saveAutoTopUp = useMutation({
    mutationFn: (input: AutoTopUpInput) =>
      withToken((token) => updateClientAutoTopUp(accountId as string, token, input)),
    onSuccess: () => invalidate("autoTopUp"),
  });

  const isLoading = paymentMethod.isLoading || subscription.isLoading || payments.isLoading;
  const card = paymentMethod.data?.card ?? null;
  const rows = payments.data?.pages.flatMap((page) => page.payments) ?? [];

  return (
    <PageContainer className="max-w-4xl py-8">
      <BillingPageHeader scope="your account" />
      {isLoading && <BillingSkeleton />}
      {!isLoading && (paymentMethod.error || subscription.error || payments.error) && (
        <p className="text-sm text-muted-foreground">Billing could not be loaded. Try again in a moment.</p>
      )}
      {!isLoading && paymentMethod.data && subscription.data && payments.data && (
        <>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <PaymentMethodPanel
              card={card}
              onConfigure={() => withToken((token) => createClientPaymentMethodSession(accountId as string, token))}
              onRemove={() => removeCard.mutate()}
              isBusy={removeCard.isPending}
            />
            <PlanPanel
              subscription={subscription.data}
              onUpgrade={() => withToken((token) => createClientCheckoutSession(token))}
              onManage={() => withToken((token) => createClientPortalSession(token, accountId as string))}
            />
          </div>
          <div className="mb-4">
            <AutoTopUpPanel
              key={`${card?.last4 ?? "none"}-${autoTopUp.data?.enabled ?? "unset"}`}
              settings={autoTopUp.data ?? { account_id: accountId as string, ...NO_AUTO_TOP_UP }}
              hasCard={!!card && !autoTopUp.isError}
              balanceUsd={formatCreditsAsUsd(credits)}
              onSave={(input) => saveAutoTopUp.mutate(input)}
              isSaving={saveAutoTopUp.isPending}
              error={saveAutoTopUp.error?.message ?? autoTopUp.data?.lastError ?? null}
            />
          </div>
          <h2 className="mb-3 mt-6 font-heading text-base font-semibold tracking-tight">Payments</h2>
          <PaymentsTable payments={rows} />
          {payments.hasNextPage && (
            <UsageLoadMore onClick={() => payments.fetchNextPage()} isLoading={payments.isFetchingNextPage} />
          )}
        </>
      )}
    </PageContainer>
  );
};

export default BillingPage;
