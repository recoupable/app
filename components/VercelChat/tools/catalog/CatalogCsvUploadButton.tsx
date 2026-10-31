import { useId, useRef } from "react";
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
  const inputId = useId();
  const triggerId = `${inputId}-trigger`;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mt-2 pt-3 border-t">
      <Button
        id={triggerId}
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasCatalogId}
        className="w-full"
        aria-controls={inputId}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload CSV File
      </Button>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept=".csv"
        aria-labelledby={triggerId}
        onChange={onFileSelect}
        className="hidden"
      />
      <p className="text-xs text-muted-foreground mt-1.5 px-1">
        {hasCatalogId ? (
          <>
            CSV must include an{" "}
            <code className="text-[10px] bg-muted px-1 py-0.5 rounded">
              isrc
            </code>{" "}
            column (case-insensitive)
          </>
        ) : (
          <>
            <span className="text-destructive">
              No catalog selected. Please select a catalog first.
            </span>
          </>
        )}
      </p>
    </div>
  );
}
