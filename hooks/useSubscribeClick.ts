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

    if (isSubscribed) {
      void createClientPortalSession(userData.account_id);
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) return;

    void createClientCheckoutSession(accessToken, window.location.href);
  };

  return {
    handleClick,
    isSubscribed,
  };
};

export default useSubscribeClick;
