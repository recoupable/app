import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import createClientPortalSession from "@/lib/stripe/createClientPortalSession";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";

const useSubscribeClick = () => {
  const { getAccessToken } = usePrivy();
  const { userData } = useUserProvider();
  const { isSubscribed } = usePaymentProvider();

  const handleClick = async () => {
    if (!userData?.account_id) return;

    const accessToken = await getAccessToken();
    if (!accessToken) return;

    if (isSubscribed) {
      await createClientPortalSession(accessToken);
      return;
    }

    await createClientCheckoutSession(accessToken);
  };

  return {
    handleClick,
    isSubscribed,
  };
};

export default useSubscribeClick;
