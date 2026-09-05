"use client";

import PageContainer from "@/components/TasksPage/PageContainer";
import useBillingScope from "@/hooks/useBillingScope";
import useAccountBalance from "@/hooks/useAccountBalance";
import useBillingReads from "@/hooks/useBillingReads";
import useBillingMutations from "@/hooks/useBillingMutations";
import { formatCreditsAsUsd } from "@/lib/credits/formatCreditsAsUsd";
import BillingPageHeader from "./BillingPageHeader";
import BillingSkeleton from "./BillingSkeleton";
import BillingAccessDenied from "./BillingAccessDenied";
import PaymentMethodPanel from "./PaymentMethodPanel";
import PlanPanel from "./PlanPanel";
import AutoTopUpPanel from "./AutoTopUpPanel";
import PaymentsSection from "./PaymentsSection";

/**
 * Card, plan, auto top-up and payments for the signed-in account, the selected
 * organization, or (via /billing/{accountId}) a specific account the api lets
 * the caller read.
 */
const BillingPage = ({
  accountId: forcedAccountId,
}: {
  accountId?: string;
}) => {
  const { accountId, isOrg, scopeLabel, forced, invalid, switchToPersonal } =
    useBillingScope(forcedAccountId);
  const balance = useAccountBalance(accountId);

  const {
    subscription,
    payments,
    autoTopUp,
    autoTopUpSettings,
    isLoading,
    failed,
    forbidden,
    ready,
    card,
  } = useBillingReads(accountId);
  const actions = useBillingMutations(accountId);

  return (
    <PageContainer className="max-w-4xl py-8">
      <BillingPageHeader scope={scopeLabel} />
      {(invalid || forbidden) && <BillingAccessDenied />}
      {!invalid && isLoading && <BillingSkeleton />}
      {!isLoading && failed && !forbidden && (
        <p className="text-sm text-muted-foreground">
          Billing could not be loaded. Try again in a moment.
        </p>
      )}
      {ready && subscription.data && payments.data && (
        <>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <PaymentMethodPanel
              card={card}
              onConfigure={actions.configureCard}
              onRemove={() => actions.removeCard.mutate()}
              isBusy={actions.removeCard.isPending}
              onSwitchToPersonal={
                isOrg && !forced ? switchToPersonal : undefined
              }
            />
            <PlanPanel
              subscription={subscription.data}
              onUpgrade={actions.upgrade}
              onManage={actions.manageBilling}
              canUpgrade={!isOrg}
            />
          </div>
          <div className="mb-4">
            <AutoTopUpPanel
              key={`${card?.last4 ?? "none"}-${autoTopUp.data?.enabled ?? "unset"}`}
              settings={autoTopUpSettings}
              hasCard={!!card && !autoTopUp.isError}
              balanceUsd={formatCreditsAsUsd(balance.data ?? 0)}
              onSave={(input) => actions.saveAutoTopUp.mutate(input)}
              isSaving={actions.saveAutoTopUp.isPending}
              error={
                actions.saveAutoTopUp.error?.message ??
                autoTopUp.data?.lastError ??
                null
              }
            />
          </div>
          <PaymentsSection payments={payments} />
        </>
      )}
    </PageContainer>
  );
};

export default BillingPage;
