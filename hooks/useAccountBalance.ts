import useAccountQuery from "@/hooks/useAccountQuery";
import getAccountCredits from "@/lib/recoup/getAccountCredits";

/**
 * Remaining credits for an account (own or a member org), for the auto top-up
 * panel. Unlike the card and plan, the balance moves with every task, so it
 * goes stale after five minutes and refreshes on tab focus; it never holds the
 * page, so that refresh is invisible.
 */
const useAccountBalance = (accountId: string | undefined) =>
  useAccountQuery(
    ["credits", "balance"],
    accountId,
    async (id, token) => {
      const credits = await getAccountCredits(id, token);
      return credits.remaining_credits;
    },
    { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true },
  );

export default useAccountBalance;
