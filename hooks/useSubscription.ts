import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import type Stripe from "stripe";
import { useUserProvider } from "@/providers/UserProvder";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export type SubscriptionSource = "account" | "organization" | null;

export interface SubscriptionResponse {
  /** True when the account or any of its organizations has an active subscription. */
  isPro: boolean;
  /** Where the active subscription is anchored. `null` when there is no active subscription. */
  source: SubscriptionSource;
  /** The active Stripe Subscription (account preferred over organization), or `null`. */
  subscription: Stripe.Subscription | null;
}

const fetchSubscription = async (
  accessToken: string,
): Promise<SubscriptionResponse> => {
  const response = await fetch(`${getClientApiBaseUrl()}/api/subscription`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return response.json();
};

const useSubscription = (): UseQueryResult<SubscriptionResponse> => {
  const { userData } = useUserProvider();
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: ["subscription", userData?.account_id],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return fetchSubscription(accessToken!);
    },
    enabled: !!userData?.account_id && authenticated,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export default useSubscription;
