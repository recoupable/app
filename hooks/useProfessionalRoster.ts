"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { requestProfessionalRoster } from "@/lib/professionals/requestProfessionalRoster";

export function useProfessionalRoster(organizationId: string | null) {
  const { getAccessToken, authenticated } = usePrivy();
  const { userData } = useUserProvider();
  return useInfiniteQuery({
    queryKey: ["professional-roster", userData?.account_id, organizationId],
    enabled: authenticated && !!userData?.account_id && !!organizationId,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getAccessToken();
      if (!token || !organizationId)
        throw new Error("Sign in and select an organization.");
      const result = await requestProfessionalRoster(
        token,
        organizationId,
        undefined,
        pageParam,
      );
      if (!("professionals" in result))
        throw new Error("Invalid roster response");
      return result;
    },
    getNextPageParam: (page) => page.next_cursor ?? undefined,
    retry: false,
  });
}
