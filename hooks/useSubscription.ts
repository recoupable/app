import useAccountQuery from "@/hooks/useAccountQuery";
import getAccountSubscription from "@/lib/recoup/getAccountSubscription";

/** The plan covering an account, with amount, interval and collection method. */
const useSubscription = (accountId: string | undefined) =>
  useAccountQuery("subscription", accountId, getAccountSubscription);

export default useSubscription;
