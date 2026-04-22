export type ToggleFavoriteRequest = {
  templateId: string;
  isFavourite: boolean;
};

export type ToggleFavoriteResponse = {
  success: true;
  favorites_count: number | null;
} | {
  error: string;
};

export type AgentTemplateRow = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  tags: string[] | null;
  creator: string | null;
  is_private: boolean;
  created_at: string | null;
  favorites_count: number | null;
  updated_at: string | null;
  // computed for requesting user
  is_favourite?: boolean;
  // emails the template is shared with (only for private templates)
  shared_emails?: string[];
};

