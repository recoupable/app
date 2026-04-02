import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getPulse } from "@/lib/pulse/getPulse";
import { updatePulse } from "@/lib/pulse/updatePulse";
import { toast } from "sonner";

const QUERY_KEY = ["pulse"];

export function usePulseToggle() {
  const { getAccessToken, authenticated } = usePrivy();
  const queryClient = useQueryClient();

  const { data, isLoading: isInitialLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getPulse({ accessToken: accessToken! });
    },
    enabled: authenticated,
  });

  const { mutate, isPending: isToggling } = useMutation({
    mutationFn: async (active: boolean) => {
      const accessToken = await getAccessToken();
      return updatePulse({ accessToken: accessToken!, active });
    },
    onMutate: async (newActive) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousData = queryClient.getQueryData(QUERY_KEY);
      queryClient.setQueryData(QUERY_KEY, (old: typeof data) =>
        old
          ? { ...old, pulses: [{ ...old.pulses[0], active: newActive }] }
          : old,
      );
      return { previousData };
    },
    onError: (_err, _newActive, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousData);
      toast.error("Failed to update pulse status");
    },
    onSuccess: (data) => {
      toast.success(
        data.pulses[0].active ? "Pulse activated" : "Pulse deactivated",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    active: data?.pulses?.[0]?.active ?? false,
    isInitialLoading,
    isToggling,
    togglePulse: mutate,
  };
}
