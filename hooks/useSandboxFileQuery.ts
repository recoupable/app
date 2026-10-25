import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getFileContents } from "@/lib/sandboxes/getFileContents";
import type { OpenedFileRevision } from "@/lib/sandboxes/guardedFileTypes";
import { useSandboxAccountScope } from "./useSandboxAccountScope";

export function useSandboxFileQuery(
  path: string | undefined,
  enabled: boolean,
  includeRevision: boolean,
) {
  const { getAccessToken } = usePrivy();
  const scope = useSandboxAccountScope();
  const { scopeKey, apiBaseUrl } = scope;
  const client = useQueryClient();
  const writableRevision = includeRevision && !scope.readOnly;
  const prefix = ["sandbox-file-content", apiBaseUrl, scopeKey];
  const query = useQuery({
    queryKey: [...prefix, path, includeRevision],
    enabled: Boolean(enabled && path && scope.ready),
    queryFn: async ({ signal }) => {
      if (!path) throw new Error("Select a file to open.");
      if (!scope.ready || signal.aborted || !scope.isCurrent())
        throw new Error("Select an account to view files.");
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to view file contents");
      if (signal.aborted || !scope.isCurrent())
        throw new Error("The account or connection changed. Reopen this file.");
      const result = await getFileContents(accessToken, path, {
        includeRevision: writableRevision,
        accountId: scope.accountId,
      });
      if (signal.aborted || !scope.isCurrent())
        throw new Error("The account or connection changed. Reopen this file.");
      const openedRevision: OpenedFileRevision | undefined =
        writableRevision && result.sha && scopeKey
          ? { path, sha: result.sha, apiBaseUrl, scopeKey }
          : undefined;
      return { ...result, openedRevision };
    },
    ...(writableRevision && {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    }),
  });
  const reopen = useCallback(
    (target: string) => {
      void client.invalidateQueries({
        queryKey: ["sandbox-file-content", apiBaseUrl, scopeKey, target],
      });
    },
    [client, apiBaseUrl, scopeKey],
  );
  return { query, scopeKey, reopen, ready: scope.ready };
}
