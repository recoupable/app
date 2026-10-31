import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getSandboxes } from "@/lib/sandboxes/getSandboxes";
import { convertFileTreeEntries } from "@/lib/sandboxes/convertFileTreeEntries";
import getSubtreeAtPath from "@/lib/sandboxes/getSubtreeAtPath";
import type { Sandbox } from "@/lib/sandboxes/createSandbox";
import type { FileNode } from "@/lib/sandboxes/parseFileTree";
import { useSandboxAccountScope } from "./useSandboxAccountScope";

interface UseSandboxesReturn {
  sandboxes: Sandbox[];
  filetree: FileNode[];
  isLoading: boolean;
  scopeReady: boolean;
  error: Error | null;
  refetch: () => void;
}

export default function useSandboxes(): UseSandboxesReturn {
  const { getAccessToken, authenticated } = usePrivy();
  const scope = useSandboxAccountScope();
  const enabled = authenticated && scope.ready;

  const query = useQuery({
    queryKey: ["sandboxes", scope.apiBaseUrl, scope.scopeKey],
    queryFn: async ({ signal }) => {
      if (!enabled || signal.aborted || !scope.isCurrent())
        throw new Error("Select an account to view files.");
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to view sandboxes");
      }
      if (signal.aborted || !scope.isCurrent())
        throw new Error("The account or connection changed. Reload the files.");
      const result = await getSandboxes(accessToken, scope.accountId);
      if (signal.aborted || !scope.isCurrent())
        throw new Error("The account or connection changed. Reload the files.");
      return result;
    },
    enabled,
  });

  const entries = enabled && !query.error ? query.data?.filetree : undefined;
  const filetree = useMemo(() => {
    if (!entries) return [];
    const tree = convertFileTreeEntries(entries);
    return getSubtreeAtPath(tree);
  }, [entries]);

  return {
    sandboxes: enabled && !query.error ? query.data?.sandboxes || [] : [],
    filetree,
    isLoading: query.isLoading,
    scopeReady: enabled,
    error: query.error,
    refetch: query.refetch,
  };
}
