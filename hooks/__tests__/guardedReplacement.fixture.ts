// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import { useGuardedFileReplacement } from "../useGuardedFileReplacement";
import { uploadSandboxFiles } from "@/lib/sandboxes/uploadSandboxFiles";
import { SandboxFileConflictError } from "@/lib/sandboxes/SandboxFileConflictError";

const token = vi.fn(async (): Promise<string | null> => "synthetic-token");
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    getAccessToken: token,
    authenticated: true,
    user: { id: "actor-a" },
  }),
}));
vi.mock("@/lib/sandboxes/uploadSandboxFiles", () => ({
  uploadSandboxFiles: vi.fn(),
}));
vi.mock("@/lib/sandboxes/getGuardedGitApiBaseUrl", () => ({
  getGuardedGitApiBaseUrl: () => "https://api-synthetic-recoup.vercel.app",
}));
const opened = {
  path: "notes/draft.txt",
  sha: "a".repeat(40),
  scopeKey: "actor-a",
  apiBaseUrl: "https://api-synthetic-recoup.vercel.app",
};
const file = new File(["Unsaved replacement"], "draft.txt");
const saved = vi.fn();
const initial = {
  enabled: true,
  opened,
  selectedPath: opened.path,
  scopeKey: opened.scopeKey,
  onSaved: saved,
};
beforeEach(() => {
  vi.clearAllMocks();
  token.mockResolvedValue("synthetic-token");
});
export {
  act,
  renderHook,
  waitFor,
  useGuardedFileReplacement,
  uploadSandboxFiles,
  SandboxFileConflictError,
  token,
  opened,
  file,
  saved,
  initial,
};
