export type SandboxStreamStatus = "booting" | "streaming" | "complete" | "error";

export interface SandboxStreamProgress {
  status: SandboxStreamStatus;
  sandboxId?: string;
  output: string;
  stderr?: string;
  exitCode?: number;
  created?: boolean;
  fromSnapshot?: boolean;
  runId?: string;
}
