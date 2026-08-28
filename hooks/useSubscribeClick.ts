import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useUserProvider } from "@/providers/UserProvder";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import createClientPortalSession from "@/lib/stripe/createClientPortalSession";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";

const useSubscribeClick = () => {
  const { getAccessToken, login } = usePrivy();
  const { userData } = useUserProvider();
  const { isSubscribed } = usePaymentProvider();

  const handleClick = async () => {
    if (!userData?.account_id) {
      login();
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      login();
      return;
    }

    if (isSubscribed) {
      const result = await createClientPortalSession(accessToken);
      if (result?.error) {
        toast.error("Could not open billing. Please try again.");
      }
      return;
    }

    const result = await createClientCheckoutSession(accessToken);
    if (result?.error) {
      toast.error("Could not start checkout. Please try again.");
    }
  };

  return {
    handleClick,
    isSubscribed,
  };
};

export default useSubscribeClick;
