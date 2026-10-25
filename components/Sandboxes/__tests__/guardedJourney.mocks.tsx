import React from "react";
import { cleanup } from "@testing-library/react";
import { beforeEach, afterEach, vi } from "vitest";
import { fixture, file, opened } from "./guardedJourney.data";
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    getAccessToken: async () => "synthetic-token",
    authenticated: true,
    user: { id: fixture.actor },
  }),
}));
vi.mock("@/lib/sandboxes/uploadSandboxFiles", () => ({
  uploadSandboxFiles: vi.fn(),
}));
vi.mock("@/lib/sandboxes/getGuardedGitApiBaseUrl", () => ({
  getGuardedGitApiBaseUrl: () =>
    fixture.enabled ? "https://api-synthetic-recoup.vercel.app" : null,
}));
vi.mock("@/hooks/useSandboxes", () => ({
  default: () => ({
    filetree: fixture.empty
      ? []
      : [{ name: "draft.txt", path: "notes/draft.txt", type: "file" }],
    isLoading: fixture.loading,
    error: fixture.listingError,
    refetch: fixture.refetch,
  }),
}));
vi.mock("@/hooks/useSandboxFileDrop", () => ({
  useSandboxFileDrop: () => ({
    handleFilesDropped: fixture.legacy,
    uploading: false,
  }),
}));
vi.mock("@/hooks/useSandboxFileContent", () => ({
  default: (options: { includeRevision?: boolean }) => ({
    selectedPath: "notes/draft.txt",
    scopeKey: fixture.actor,
    content: "Opened draft",
    imageUrl: null,
    loading: false,
    error: null,
    select: vi.fn(),
    reopen: fixture.reopen,
    openedRevision: options.includeRevision
      ? { ...opened, scopeKey: fixture.actor }
      : undefined,
  }),
}));
vi.mock("@/components/ai-elements/file-tree", () => ({
  FileTree: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("../FileNodeComponent", () => ({ default: () => null }));
vi.mock("../SandboxFilePreview", () => ({
  default: () => <p>Opened draft</p>,
}));
vi.mock("../SandboxDropZone", () => ({
  default: ({
    onDrop,
    children,
  }: {
    onDrop: (files: File[]) => void;
    children: React.ReactNode;
  }) => (
    <div>
      <button onClick={() => onDrop([file])}>Drop replacement</button>
      {children}
    </div>
  ),
}));
beforeEach(() => {
  vi.clearAllMocks();
  fixture.enabled = true;
  fixture.actor = "actor-a";
  fixture.loading = false;
  fixture.listingError = null;
  fixture.empty = false;
});
afterEach(cleanup);
