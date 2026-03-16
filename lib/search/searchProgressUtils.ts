import { SearchProgress } from "@/lib/tools/searchWeb/types";

export const isSearchProgressUpdate = (result: unknown): result is SearchProgress => {
  return (
    result !== null && typeof result === "object" && "status" in result && !("success" in result)
  ); // Final results have 'success', progress updates have 'status'
};

export const asSearchProgress = (result: unknown): SearchProgress | null => {
  return isSearchProgressUpdate(result) ? result : null;
};
