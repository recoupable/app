import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogCsvUploadButtonProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hasCatalogId?: boolean;
}

/**
 * CSV file upload button for catalog songs
 * Accepts CSV files with isrc column (case-insensitive)
 * catalog_id is automatically used from the selected catalog
 */
export default function CatalogCsvUploadButton({
  onFileSelect,
  hasCatalogId = true,
}: CatalogCsvUploadButtonProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3">
      <label htmlFor="csv-upload" className="block">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasCatalogId}
          className="w-full bg-card"
          onClick={() => document.getElementById("csv-upload")?.click()}
        >
          <Upload className="mr-2 size-4" />
          Upload CSV File
        </Button>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={onFileSelect}
          className="hidden"
        />
      </label>
      <p className="mt-2 px-0.5 text-xs text-muted-foreground">
        {hasCatalogId ? (
          <>
            CSV must include an{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[10px] text-foreground">
              isrc
            </code>{" "}
            column (case-insensitive)
          </>
        ) : (
          <span className="text-destructive">
            No catalog selected. Please select a catalog first.
          </span>
        )}
      </p>
    </div>
  );
}
