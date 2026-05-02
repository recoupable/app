import { useUserProvider } from "@/providers/UserProvder";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import createClientPortalSession from "@/lib/stripe/createClientPortalSession";

const useSubscribeClick = () => {
  const { userData } = useUserProvider();
  const { isSubscribed } = usePaymentProvider();

  const handleClick = () => {
    if (!userData?.account_id) return;

    if (isSubscribed) {
      createClientPortalSession(userData.account_id);
    }
  };

  return {
    handleClick,
    isSubscribed,
  };
};

export default useSubscribeClick;
