"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserProvider } from "@/providers/UserProvder";
import { useArtistProvider } from "@/providers/ArtistProvider";

export interface ListedFileRow {
  id: string;
  file_name: string;
  storage_key: string;
  mime_type: string | null;
  is_directory?: boolean;
}

export default function useFilesManager(activePath?: string, recursive: boolean = false) {
  const { userData } = useUserProvider();
  const { selectedArtist } = useArtistProvider();

  const ownerAccountId = useMemo(() => userData?.account_id || "", [userData]);
  const artistAccountId = useMemo(() => selectedArtist?.account_id || "", [selectedArtist]);

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ files: Array<ListedFileRow> }>({
    queryKey: ["files", ownerAccountId, artistAccountId, activePath, recursive],
    queryFn: async () => {
      // Transform full storage path to relative path for API
      // From: files/{owner_id}/{artist_id}/relative/path/
      // To: relative/path/
      let relativePath: string | undefined = undefined;
      if (activePath) {
        const parts = activePath.replace(/\/$/, "").split("/");
        if (parts.length > 3) {
          relativePath = parts.slice(3).join("/");
          if (relativePath) relativePath += "/";
        }
      }
      
      const p = relativePath ? `&path=${encodeURIComponent(relativePath)}` : "";
      const r = recursive ? "&recursive=true" : "";
      const url = `/api/files/list?ownerAccountId=${ownerAccountId}&artistAccountId=${artistAccountId}${p}${r}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load files");
      return res.json();
    },
    enabled: Boolean(ownerAccountId && artistAccountId),
  });

  // Prefetch next-level directories for snappier navigation
  useEffect(() => {
    const items = data?.files || [];
    if (items.length === 0) return;
    const basePath = activePath
      ? activePath.endsWith("/") ? activePath : activePath + "/"
      : `files/${ownerAccountId}/${artistAccountId}/`;
    items.filter((f) => f.is_directory).forEach((dir) => {
      const childPath = `${basePath}${dir.file_name}/`;
      qc.prefetchQuery({
        queryKey: ["files", ownerAccountId, artistAccountId, childPath],
        queryFn: async () => {
          const url = `/api/files/list?ownerAccountId=${ownerAccountId}&artistAccountId=${artistAccountId}&path=${encodeURIComponent(childPath)}`;
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error("Failed to load files");
          return res.json();
        },
        staleTime: 30000,
      });
    });
  }, [data?.files, activePath, ownerAccountId, artistAccountId, qc]);

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/files/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerAccountId, artistAccountId, name, parentPath: activePath || `files/${ownerAccountId}/${artistAccountId}/` }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create folder");
      return json.folder as ListedFileRow;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["files", ownerAccountId, artistAccountId] });
    },
  });

  async function handleUpload(selectedFile?: File) {
    const targetFile = selectedFile || file;
    if (!targetFile) return;
    if (!ownerAccountId || !artistAccountId) {
      setStatus("Missing account or artist");
      return;
    }
    setStatus("Uploading...");

    const safeName = targetFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const basePath = activePath
      ? (activePath.endsWith("/") ? activePath : activePath + "/")
      : `files/${ownerAccountId}/${artistAccountId}/`;
    const key = `${basePath}${safeName}`;

    // Request a signed upload URL from the server (service role)
    const sig = await fetch("/api/storage/signed-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const sigJson = await sig.json();
    if (!sig.ok) {
      setStatus(`Error: ${sigJson.error || sig.statusText}`);
      return;
    }

    // Upload file directly to Supabase Storage using the signed URL
    const uploadRes = await fetch(sigJson.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": targetFile.type || "application/octet-stream",
      },
      body: targetFile,
    });

    if (!uploadRes.ok) {
      setStatus(`Error: Failed to upload (${uploadRes.status})`);
      return;
    }

    // Record metadata
    const rec = await fetch("/api/files/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerAccountId,
        artistAccountId,
        storageKey: key,
        fileName: targetFile.name,
        mimeType: targetFile.type,
        sizeBytes: targetFile.size,
      }),
    });
    const recJson = await rec.json();
    if (!rec.ok) {
      setStatus(`Error: ${recJson.error || rec.statusText}`);
      return;
    }

    setStatus("Uploaded successfully");
    if (!selectedFile) setFile(null);
    await qc.invalidateQueries({ queryKey: ["files", ownerAccountId, artistAccountId] });

    // Clear success status after 3 seconds to be ready for new uploads
    setTimeout(() => {
      setStatus("");
    }, 3000);
  }

  return {
    ownerAccountId,
    artistAccountId,
    file,
    setFile,
    status,
    setStatus,
    isLoading,
    files: data?.files || [],
    handleUpload,
    createFolder: (name: string) => createFolderMutation.mutateAsync(name),
    refreshFiles: async () => {
      await qc.invalidateQueries({ queryKey: ["files", ownerAccountId, artistAccountId] });
    },
  };
}


