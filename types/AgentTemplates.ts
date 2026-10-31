export type TemplateCreator = {
  id: string;
  name: string | null;
  image: string | null;
  is_admin: boolean;
};

export type AgentTemplateRow = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  tags: string[] | null;
  creator: TemplateCreator | null;
  is_private: boolean;
  created_at: string | null;
  favorites_count: number | null;
  updated_at: string | null;
  is_favourite: boolean;
  shared_emails: string[];
};
