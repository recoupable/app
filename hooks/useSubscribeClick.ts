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
      const accessToken = await getAccessToken();
      if (!accessToken) return;
      void createClientPortalSession(accessToken);
      return;
    }
    createClientCheckoutSession(userData.account_id);
  };

  return {
    handleClick,
    isSubscribed,
  };
};

export default useSubscribeClick;
