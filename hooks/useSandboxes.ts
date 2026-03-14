import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getSandboxes } from "@/lib/sandboxes/getSandboxes";
import { convertFileTreeEntries } from "@/lib/sandboxes/convertFileTreeEntries";
import getSubtreeAtPath from "@/lib/sandboxes/getSubtreeAtPath";
import type { Sandbox } from "@/lib/sandboxes/createSandbox";
import type { FileNode } from "@/lib/sandboxes/parseFileTree";

interface UseSandboxesReturn {
  sandboxes: Sandbox[];
  filetree: FileNode[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 *
 */
export default function useSandboxes(): UseSandboxesReturn {
  const { getAccessToken, authenticated } = usePrivy();

  const query = useQuery({
    queryKey: ["sandboxes"],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to view sandboxes");
      }
      return getSandboxes(accessToken);
    },
    enabled: authenticated,
  });

  const filetree = useMemo(() => {
    if (!query.data?.filetree) return [];
    const tree = convertFileTreeEntries(query.data.filetree);
    return getSubtreeAtPath(tree);
  }, [query.data?.filetree]);

  return {
    sandboxes: query.data?.sandboxes || [],
    filetree,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
