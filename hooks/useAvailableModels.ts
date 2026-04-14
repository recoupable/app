import { useQuery } from "@tanstack/react-query";
import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";

/**
 * A thin wrapper around TanStack's useQuery to fetch the list of
 * available Large-Language-Models (LLMs).
 */
const useAvailableModels = () =>
  useQuery<GatewayLanguageModelEntry[]>({
    queryKey: ["available-models"],
    queryFn: async () => {
      const res = await fetch("/api/ai/models");
      if (!res.ok) throw new Error("Failed to load models");
      const data = (await res.json()) as {
        models: GatewayLanguageModelEntry[];
      };
      return data.models;
    },
    staleTime: 5 * 60 * 1000,
  });

export default useAvailableModels;
