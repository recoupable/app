export interface PerplexityMessage {
  role: string;
  content: string;
}

export interface PerplexityStreamChunk {
  id: string;
  model: string;
  created: number;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
  search_results?: SearchResult[];
  citations?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

export interface StreamedResponse {
  content: string;
  searchResults: SearchResult[];
  citations: string[];
}
