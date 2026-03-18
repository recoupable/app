import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { toast } from "sonner";
import { createApiKey } from "@/lib/keys/createApiKey";
import { fetchApiKeys, ApiKey } from "@/lib/keys/fetchApiKeys";
import { deleteApiKey } from "@/lib/keys/deleteApiKey";

interface UseApiKeyReturn {
  createApiKey: (keyName: string) => Promise<void>;
  apiKey: string | null;
  showApiKeyModal: boolean;
  setShowApiKeyModal: (show: boolean) => void;
  apiKeys: ApiKey[];
  loadingKeys: boolean;
  deleteApiKey: (keyId: string) => Promise<void>;
}

export default function useApiKey(): UseApiKeyReturn {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const { userData } = useUserProvider();
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const queryKey = ["apiKeys", userData?.account_id] as const;

  const { data: apiKeys = [], isLoading: loadingKeys } = useQuery<ApiKey[]>({
    queryKey,
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      return fetchApiKeys(accessToken);
    },
    enabled: Boolean(userData?.account_id),
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (keyName: string) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      return createApiKey(keyName.trim(), accessToken);
    },
    onSuccess: (key) => {
      setApiKey(key);
      setShowApiKeyModal(true);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create API key");
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      return deleteApiKey(keyId, accessToken);
    },
    onSuccess: () => {
      toast.success("API key deleted successfully");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete API key");
    },
  });

  const createApiKeyHandler = async (keyName: string): Promise<void> => {
    if (!userData?.account_id) {
      toast.error("Account not found. Please sign in.");
      return;
    }

    await createApiKeyMutation.mutateAsync(keyName);
  };

  const deleteApiKeyHandler = async (keyId: string): Promise<void> => {
    await deleteApiKeyMutation.mutateAsync(keyId);
  };

  return {
    createApiKey: createApiKeyHandler,
    apiKey,
    showApiKeyModal,
    setShowApiKeyModal,
    apiKeys,
    loadingKeys,
    deleteApiKey: deleteApiKeyHandler,
  };
}
