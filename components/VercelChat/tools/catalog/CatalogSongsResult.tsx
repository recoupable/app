"use client";

import { CatalogSongsResponse } from "@/lib/catalog/getCatalogSongs";
import { useCatalogSongsFileSelect } from "@/hooks/useCatalogSongsFileSelect";
import { Progress } from "@/components/ui/progress";
import HideMissingItemsToggle from "./HideMissingItemsToggle";
import CatalogCsvUploadButton from "./CatalogCsvUploadButton";
import InsertCatalogSongsList from "./InsertCatalogSongsList";
import InsertCatalogSongsSummary from "./InsertCatalogSongsSummary";
import InsertCatalogSongsStatus from "./InsertCatalogSongsStatus";
import { useMemo, useState } from "react";
import { isCompleteSong } from "@/lib/catalog/isCompleteSong";

export interface CatalogSongsResult {
  success: boolean;
  songs?: CatalogSongsResponse["songs"];
  pagination?: CatalogSongsResponse["pagination"];
  total_added?: number;
  message?: string;
  error?: string;
}

interface CatalogSongsResultProps {
  result: CatalogSongsResult;
}

export default function CatalogSongsResult({
  result,
}: CatalogSongsResultProps) {
  const catalogId = result.songs?.[0]?.catalog_id;
  const {
    isUploading,
    uploadResult,
    uploadError,
    uploadProgress,
    handleFileSelect,
  } = useCatalogSongsFileSelect(catalogId);

  const displayResult = uploadResult || result;
  const hasError = !!(uploadError || (!result.success && result.error));

  const progressPercentage =
    uploadProgress.total > 0
      ? (uploadProgress.current / uploadProgress.total) * 100
      : 0;

  const [hideIncomplete, setHideIncomplete] = useState(true);

  const allSongs = displayResult.songs || [];
  const filteredSongs = useMemo(() => {
    return hideIncomplete ? allSongs.filter(isCompleteSong) : allSongs;
  }, [allSongs, hideIncomplete]);

  const isSuccess = allSongs.length > 0;

  // Don't show a green "added" line when nothing was added — gate the copy on
  // the actual count rather than just the absence of an error.
  const successMessage = useMemo(() => {
    if (displayResult.total_added === 0) {
      return "No new songs — everything was already in your catalog.";
    }
    return displayResult.message;
  }, [displayResult.total_added, displayResult.message]);

  return (
    <div className="flex w-full max-w-xl flex-col gap-2.5 py-2">
      <InsertCatalogSongsStatus
        hasError={hasError}
        errorMessage={uploadError || result.error}
        successMessage={successMessage}
      />

      {/* Songs Added Summary */}
      {isSuccess && (
        <InsertCatalogSongsSummary
          totalAdded={displayResult.total_added}
          pagination={displayResult.pagination}
        />
      )}

      {isSuccess && (
        <HideMissingItemsToggle
          checked={hideIncomplete}
          onCheckedChange={setHideIncomplete}
        />
      )}

      {/* Render the songs pane whenever there's no error so the list's own
          empty-state shows on a successful response with zero songs. */}
      {!hasError && (
        <div className="max-h-[60vh] overflow-y-auto">
          <InsertCatalogSongsList
            songs={filteredSongs}
            totalCount={allSongs.length}
          />
        </div>
      )}

      {isUploading && uploadProgress.total > 0 ? (
        <div className="space-y-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-center text-xs tabular-nums text-muted-foreground">
            Uploading {uploadProgress.current.toLocaleString()} /{" "}
            {uploadProgress.total.toLocaleString()} songs
          </p>
        </div>
      ) : (
        <CatalogCsvUploadButton
          onFileSelect={handleFileSelect}
          hasCatalogId={!!catalogId}
        />
      )}
    </div>
  );
}
