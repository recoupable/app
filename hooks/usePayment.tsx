import { DEFAULT_CREDITS, PRO_CREDITS } from "@/lib/consts";
import useCredits from "./useCredits";
import useSubscription from "./useSubscription";
import { useUserProvider } from "@/providers/UserProvder";

const usePayment = () => {
  const { email, userData } = useUserProvider();
  const {
    data: creditsData,
    isLoading: isLoadingCredits,
    refetch: refetchCredits,
  } = useCredits();
  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useSubscription();

  const isLoadingUser = email === undefined || (!!email && !userData);
  const credits = creditsData?.remaining_credits || 0;

  // Check pro status (account subscription or org subscription)
  const isSubscribed = subscriptionData?.isPro || false;
  const totalCredits = isSubscribed ? PRO_CREDITS : DEFAULT_CREDITS;

  return {
    isLoading: isLoadingCredits || isLoadingSubscription || isLoadingUser,
    credits,
    totalCredits,
    isSubscribed,
    refetchCredits,
  };
};

export default usePayment;
