"use client";

import SandboxFileWorkspace from "./SandboxFileWorkspace";
import useSandboxes from "@/hooks/useSandboxes";
import useSandboxFileContent from "@/hooks/useSandboxFileContent";
import { useSandboxFileDrop } from "@/hooks/useSandboxFileDrop";
import { useState } from "react";
import { getGuardedGitApiBaseUrl } from "@/lib/sandboxes/getGuardedGitApiBaseUrl";
import { useGuardedFileReplacement } from "@/hooks/useGuardedFileReplacement";
import GuardedFileReplacementNotice from "./GuardedFileReplacementNotice";
import { useSandboxAccountScope } from "@/hooks/useSandboxAccountScope";

export default function SandboxFileTree() {
  const { readOnly } = useSandboxAccountScope();
  const listing = useSandboxes();
  const { filetree, refetch } = listing;
  const [protectReplacement, setProtectReplacement] = useState(false);
  const available = Boolean(getGuardedGitApiBaseUrl());
  const fileContent = useSandboxFileContent({
    includeRevision: protectReplacement,
  });
  const { handleFilesDropped, uploading } = useSandboxFileDrop({
    selectedPath: fileContent.selectedPath,
    filetree,
    refetch,
  });
  const guarded = useGuardedFileReplacement({
    enabled: protectReplacement && !readOnly,
    opened: fileContent.openedRevision,
    selectedPath: fileContent.selectedPath,
    scopeKey: fileContent.scopeKey,
    onSaved: () => {
      refetch();
      if (fileContent.selectedPath)
        fileContent.reopen(fileContent.selectedPath);
    },
  });
  const busy = uploading || guarded.saving;
  const onDrop = (files: File[]) => {
    if (readOnly) return;
    if (protectReplacement || guarded.hasPending) void guarded.replace(files);
    else handleFilesDropped(files);
  };

  return (
    <div className="space-y-4">
      {readOnly && (
        <p className="text-sm text-muted-foreground">
          Files for the selected account are read-only. Return to your account
          to upload or replace files.
        </p>
      )}
      {(available || protectReplacement || guarded.hasPending) && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={protectReplacement || guarded.hasPending}
            disabled={busy || guarded.hasPending || readOnly}
            onChange={(event) => setProtectReplacement(event.target.checked)}
          />
          Protect replacement of the opened file
        </label>
      )}
      <GuardedFileReplacementNotice
        pending={guarded.pending}
        error={guarded.error}
        disabled={busy}
        onDiscard={guarded.discard}
        onReopen={(path) => {
          setProtectReplacement(true);
          fileContent.reopen(path);
        }}
      />
      <SandboxFileWorkspace
        listing={listing}
        fileContent={fileContent}
        onDrop={onDrop}
        busy={busy}
        readOnly={readOnly}
      />
    </div>
  );
}
