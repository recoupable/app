import type { ReactNode } from "react";
import SandboxSelectedFilePreview from "./SandboxSelectedFilePreview";
import { Loader } from "lucide-react";
import NoSandboxFiles from "./NoSandboxFiles";
import SandboxDropZone from "./SandboxDropZone";
import SandboxFileBrowser from "./SandboxFileBrowser";
import type useSandboxes from "@/hooks/useSandboxes";
import type useSandboxFileContent from "@/hooks/useSandboxFileContent";

/** File-list status must never take ownership of retained-replacement recovery. */
export default function SandboxFileWorkspace({
  listing,
  fileContent,
  onDrop,
  busy,
  readOnly = false,
}: {
  listing: ReturnType<typeof useSandboxes>;
  fileContent: ReturnType<typeof useSandboxFileContent>;
  onDrop: (files: File[]) => void;
  busy: boolean;
  readOnly?: boolean;
}) {
  const withPreview = (status: ReactNode) => (
    <>
      {status}
      <SandboxSelectedFilePreview fileContent={fileContent} />
    </>
  );
  if (!listing.scopeReady)
    return withPreview(
      <p className="text-sm text-muted-foreground">
        {readOnly
          ? "The selected account is not ready. Clear the account selection using the badge above to return to your account."
          : "Sign in to view files."}
      </p>,
    );
  if (listing.isLoading)
    return withPreview(
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Loading files...</span>
      </div>,
    );
  if (listing.error)
    return withPreview(
      <div className="text-destructive">
        <p>Failed to load files</p>
        <button
          onClick={() => listing.refetch()}
          className="text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>,
    );
  if (readOnly)
    return listing.filetree.length ? (
      <SandboxFileBrowser
        filetree={listing.filetree}
        fileContent={fileContent}
      />
    ) : (
      withPreview(<p>No files yet.</p>)
    );
  if (!listing.filetree.length)
    return withPreview(<NoSandboxFiles onDrop={onDrop} disabled={busy} />);
  return (
    <SandboxDropZone onDrop={onDrop} uploading={busy}>
      <SandboxFileBrowser
        filetree={listing.filetree}
        fileContent={fileContent}
      />
    </SandboxDropZone>
  );
}
