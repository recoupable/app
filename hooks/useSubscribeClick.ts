import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useUserProvider } from "@/providers/UserProvder";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import createClientPortalSession from "@/lib/stripe/createClientPortalSession";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";

const useSubscribeClick = () => {
  const { getAccessToken } = usePrivy();
  const { userData } = useUserProvider();
  const { isSubscribed } = usePaymentProvider();

  const handleClick = async () => {
    if (isSubscribed) {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error("Sign in to manage your subscription.");
        return;
      }
      const result = await createClientPortalSession(accessToken);
      if (result?.error) {
        const message =
          result.error instanceof Error
            ? result.error.message
            : "Could not open the billing portal.";
        toast.error(message);
      }
      return;
    }

    if (!userData?.account_id) {
      toast.error("Account is still loading. Try again in a moment.");
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
