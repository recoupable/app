export type Room = {
  id: string;
  account_id: string | null;
  topic: string | null;
  updated_at: string;
};

export type Memory = {
  id: string;
  room_id: string | null;
  content: { role: string; parts: unknown };
  updated_at: string;
};

export type MigrationResult = "migrated" | "skipped" | "failed";
