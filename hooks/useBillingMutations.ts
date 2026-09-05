import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import createClientPaymentMethodSession from "@/lib/billing/createClientPaymentMethodSession";
import deleteClientPaymentMethod from "@/lib/billing/deleteClientPaymentMethod";
import updateClientAutoTopUp, {
  AutoTopUpInput,
} from "@/lib/billing/updateClientAutoTopUp";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";
import createClientPortalSession from "@/lib/stripe/createClientPortalSession";

const describe = (error: unknown) =>
  error instanceof Error && error.message
    ? error.message
    : "Something went wrong. Please try again.";

/** The billing page's writes for one account; every failure becomes a toast. */
const useBillingMutations = (accountId: string | undefined) => {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const withToken = async <T>(fn: (token: string) => Promise<T>) => {
    const token = await getAccessToken();
    if (!token || !accountId) throw new Error("Please sign in");
    return fn(token);
  };
  const invalidate = (key: string) =>
    queryClient.invalidateQueries({ queryKey: [key, accountId] });
  const open =
    (
      label: string,
      run: (token: string) => Promise<{ error?: unknown } | void>,
    ) =>
    () =>
      withToken(run)
        .then((result) => {
          if (result?.error) toast.error(`${label}: ${describe(result.error)}`);
        })
        .catch((error) => toast.error(`${label}: ${describe(error)}`));

  const removeCard = useMutation({
    mutationFn: () =>
      withToken((token) =>
        deleteClientPaymentMethod(accountId as string, token),
      ),
    onSuccess: () => {
      invalidate("paymentMethod");
      invalidate("autoTopUp");
    },
    onError: (error) =>
      toast.error(`Could not remove the card: ${describe(error)}`),
  });
  const saveAutoTopUp = useMutation({
    mutationFn: (input: AutoTopUpInput) =>
      withToken((token) =>
        updateClientAutoTopUp(accountId as string, token, input),
      ),
    onSuccess: () => {
      invalidate("autoTopUp");
      toast.success("Auto top-up settings saved.");
    },
  });

  return {
    configureCard: open("Could not open checkout", (token) =>
      createClientPaymentMethodSession(accountId as string, token),
    ),
    upgrade: open("Could not open checkout", (token) =>
      createClientCheckoutSession(token),
    ),
    manageBilling: open("Could not open billing", (token) =>
      createClientPortalSession(token, accountId as string),
    ),
    removeCard,
    saveAutoTopUp,
  };
};

export default useBillingMutations;
