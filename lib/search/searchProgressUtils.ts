export type SearchProgressStatus =
  | "searching"
  | "reviewing"
  | "streaming"
  | "complete";

export type SearchProgress = {
  status: SearchProgressStatus;
  message: string;
  query?: string;
  content?: string;
  accumulatedContent?: string;
  searchResults?: Array<{
    title: string;
    url: string;
    snippet?: string;
    date?: string;
    last_updated?: string;
  }>;
  citations?: string[];
};

export const isSearchProgressUpdate = (result: unknown): result is SearchProgress => {
  return result !== null &&
         typeof result === 'object' &&
         'status' in result &&
         !('success' in result);
};

export const asSearchProgress = (result: unknown): SearchProgress | null => {
  return isSearchProgressUpdate(result) ? result : null;
};
