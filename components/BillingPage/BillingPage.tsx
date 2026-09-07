"use client";

import PageContainer from "@/components/TasksPage/PageContainer";
import useBillingScope from "@/hooks/useBillingScope";
import useBillingReads from "@/hooks/useBillingReads";
import useBillingMutations from "@/hooks/useBillingMutations";
import autoTopUpPanelKey from "./autoTopUpPanelKey";
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
  const scope = useBillingScope(forcedAccountId);
  const { accountId, isMine, isOrg, forced, invalid } = scope;
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
    balanceUsd,
  } = useBillingReads(accountId);
  const actions = useBillingMutations(accountId);
  // The api said no (403) or the id cannot be an account: no panels, no mutations.
  const denied = invalid || forbidden;

  return (
    <PageContainer className="max-w-4xl py-8">
      <BillingPageHeader scope={scope.scopeLabel} />
      {denied && <BillingAccessDenied />}
      {!denied && (scope.isResolving || isLoading) && <BillingSkeleton />}
      {!denied && !isLoading && failed && (
        <p className="text-sm text-muted-foreground">
          Billing could not be loaded. Try again in a moment.
        </p>
      )}
      {!denied && ready && subscription.data && payments.data && (
        <>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <PaymentMethodPanel
              card={card}
              onConfigure={() => actions.configureCard.mutate()}
              onRemove={() => actions.removeCard.mutate()}
              isBusy={actions.removeCard.isPending}
              isConfiguring={actions.configureCard.isPending}
              onSwitchToPersonal={
                isOrg && !forced ? scope.switchToPersonal : undefined
              }
            />
            <PlanPanel
              subscription={subscription.data}
              onUpgrade={actions.upgrade}
              onManage={actions.manageBilling}
              canUpgrade={isMine}
            />
          </div>
          <div className="mb-4">
            <AutoTopUpPanel
              key={autoTopUpPanelKey(accountId, card?.last4, autoTopUpSettings)}
              settings={autoTopUpSettings}
              hasCard={!!card && !autoTopUp.isError}
              balanceUsd={balanceUsd}
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
