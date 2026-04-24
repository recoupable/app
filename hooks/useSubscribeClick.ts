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
    if (!userData?.account_id) return;

    if (isSubscribed) {
      createClientPortalSession(userData.account_id);
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) return;

    const checkout = await createClientCheckoutSession(userData.account_id, accessToken);
    if (checkout?.error) {
      const message =
        checkout.error instanceof Error
          ? checkout.error.message
          : "Failed to create checkout session";
      toast.error(message);
    }
  };

  return {
    handleClick,
    isSubscribed,
  };
};

export default useSubscribeClick;
