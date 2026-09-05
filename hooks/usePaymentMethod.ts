import useAccountQuery from "@/hooks/useAccountQuery";
import getAccountPaymentMethod from "@/lib/recoup/getAccountPaymentMethod";

/** The default card on file for an account (own or a member org). */
const usePaymentMethod = (accountId: string | undefined) =>
  useAccountQuery("paymentMethod", accountId, getAccountPaymentMethod);

export default usePaymentMethod;
