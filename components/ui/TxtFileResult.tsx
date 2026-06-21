import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, FileText } from "lucide-react";
import {
  ToolCard,
  ToolCardBody,
} from "@/components/VercelChat/tools/shared/ToolCard";
import ToolError from "@/components/VercelChat/tools/shared/ToolError";

export interface TxtFileGenerationResult {
  success: boolean;
  arweaveUrl: string | null;
  smartAccountAddress?: string;
  transactionHash?: string | null;
  blockExplorerUrl?: string | null;
  message?: string;
  error?: string;
}

interface TxtFileResultProps {
  result: TxtFileGenerationResult;
}

export function TxtFileResult({ result }: TxtFileResultProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (result.arweaveUrl && !fileContent) {
      setLoading(true);
      setFetchError(null);
      fetch(result.arweaveUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch file from Arweave");
          return res.text();
        })
        .then((text) => {
          setFileContent(text);
          setLoading(false);
        })
        .catch((err) => {
          setFetchError(err.message || "Error fetching file");
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.arweaveUrl]);

  if (!result.success) {
    return (
      <ToolError
        title="Text file"
        message={result.error || "Unknown error occurred"}
      />
    );
  }

  const handleDownload = () => {
    if (result.arweaveUrl) {
      window.open(result.arweaveUrl, "_blank");
    }
  };

  let displayText: string | JSX.Element = "TXT file generated.";
  if (result.arweaveUrl) {
    if (loading) {
      displayText = "Loading file contents…";
    } else if (fetchError) {
      displayText = fetchError;
    } else if (fileContent) {
      displayText = fileContent;
    }
  } else if (result.message) {
    displayText = result.message;
  }

  return (
    <ToolCard
      icon={FileText}
      tone="info"
      title="Text file generated"
      subtitle={result.arweaveUrl ? "Stored on Arweave" : undefined}
      className="max-w-xl"
      trailing={
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!result.arweaveUrl}
          className="h-8 gap-1.5 rounded-lg px-2.5 text-xs"
        >
          <Download className="size-3.5" />
          <span className="hidden sm:inline">Download</span>
        </Button>
      }
    >
      <ToolCardBody>
        <div
          className={cn(
            "max-h-[200px] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/50 p-3 font-mono text-sm md:max-h-[400px]",
            "scrollbar-thin scrollbar-thumb-rounded",
          )}
          style={{
            transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {loading ? (
            <p className="text-muted-foreground">Loading file contents…</p>
          ) : fetchError ? (
            <p className="text-destructive">{fetchError}</p>
          ) : (
            displayText
          )}
        </div>
      </ToolCardBody>
    </ToolCard>
  );
}

export default TxtFileResult;
