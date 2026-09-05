import usePaymentMethod from "@/hooks/usePaymentMethod";
import useSubscription from "@/hooks/useSubscription";
import usePayments from "@/hooks/usePayments";
import useAutoTopUp from "@/hooks/useAutoTopUp";

const NO_AUTO_TOP_UP = {
  enabled: false,
  amountCents: null,
  thresholdCents: null,
  lastRunAt: null,
  lastError: null,
};

/** The four reads behind /billing for one account, with the page's loading and failure gates. */
const useBillingReads = (accountId: string | undefined) => {
  const paymentMethod = usePaymentMethod(accountId);
  const subscription = useSubscription(accountId);
  const payments = usePayments(accountId);
  const autoTopUp = useAutoTopUp(accountId);

  // The auto top-up read is in the gate so the panel never shows Off defaults while it loads.
  const isLoading =
    paymentMethod.isLoading ||
    subscription.isLoading ||
    payments.isLoading ||
    autoTopUp.isLoading;
  const failed = paymentMethod.error || subscription.error || payments.error;
  const ready =
    !isLoading &&
    !!paymentMethod.data &&
    !!subscription.data &&
    !!payments.data;
  const card = paymentMethod.data?.card ?? null;
  const rows = payments.data?.pages.flatMap((page) => page.payments) ?? [];
  // Documented defaults when the account has never configured auto top-up (or the read failed).
  const autoTopUpSettings = autoTopUp.data ?? {
    account_id: accountId as string,
    ...NO_AUTO_TOP_UP,
  };

  return {
    paymentMethod,
    subscription,
    payments,
    autoTopUp,
    autoTopUpSettings,
    isLoading,
    failed,
    ready,
    card,
    rows,
  };
};

export default useBillingReads;
