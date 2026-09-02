/**
 * The shapes `api.recoupable.dev` returns for a client project, as documented
 * in recoupable/docs#326. Declared here rather than derived from
 * `database.types.ts` because the app only ever sees the API's response, never
 * the table — the same reason `lib/recoup/getArtistProfile.ts` declares its own.
 */

export interface ProjectCollaborator {
  account_id: string;
  /** `accounts.name`, frequently null today. Render a fallback. */
  name?: string | null;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  /** A calendar date, `2026-09-12`. No time of day. */
  due_date?: string | null;
  /** Who the task waits on. Drives the "needs you" treatment. */
  assignee_account_id?: string | null;
  /** Null means open. This field is the completed state. */
  completed_at?: string | null;
  completed_by?: string | null;
  comment_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  name: string;
  created_at: string;
}

export interface ProjectComment {
  id: string;
  task_id: string;
  account_id: string;
  author_name?: string | null;
  body: string;
  created_at: string;
}

export interface ProjectResponse {
  status: string;
  project: Project;
  tasks: ProjectTask[];
  collaborators: ProjectCollaborator[];
}

export interface ProjectTaskResponse {
  status: string;
  task: ProjectTask;
  comments: ProjectComment[];
  collaborators: ProjectCollaborator[];
}
