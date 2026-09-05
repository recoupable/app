import useAccountQuery from "@/hooks/useAccountQuery";
import getAccountCredits from "@/lib/recoup/getAccountCredits";

/** Remaining credits for an account (own or a member org), for the auto top-up panel. */
const useAccountBalance = (accountId: string | undefined) =>
  useAccountQuery("credits", accountId, async (id, token) => {
    const credits = await getAccountCredits(id, token);
    return credits.remaining_credits;
  });

export default useAccountBalance;
