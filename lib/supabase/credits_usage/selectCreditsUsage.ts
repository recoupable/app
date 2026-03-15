import serverClient from "../serverClient";
import { Tables } from "@/types/database.types";

export type CreditsUsage = Tables<"credits_usage">;

interface SelectCreditsUsageParams {
  account_id?: string;
}

export const selectCreditsUsage = async (
  params?: SelectCreditsUsageParams,
): Promise<CreditsUsage[]> => {
  let query = serverClient.from("credits_usage").select();

  if (params?.account_id) {
    query = query.eq("account_id", params.account_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error selecting credits usage:", error);
    throw error;
  }

  return data;
};
