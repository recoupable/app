import useAccountQuery from "@/hooks/useAccountQuery";
import getAccountAutoTopUp from "@/lib/recoup/getAccountAutoTopUp";

/** The opt-in auto top-up settings for an account. */
const useAutoTopUp = (accountId: string | undefined) =>
  useAccountQuery("autoTopUp", accountId, getAccountAutoTopUp);

export default useAutoTopUp;
