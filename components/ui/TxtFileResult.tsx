import React, { useState, useEffect, type JSX } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

export interface TxtFileGenerationResult {
  success: boolean;
  txtUrl?: string | null;
  arweaveUrl?: string | null;
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
  const fileUrl = result.txtUrl || result.arweaveUrl;
  const [loaded, setLoaded] = useState<{
    url: string;
    content: string | null;
    error: string | null;
  } | null>(null);
  const fileContent = loaded?.url === fileUrl ? loaded?.content : null;
  const fetchError = loaded?.url === fileUrl ? loaded?.error : null;
  const loading = Boolean(result.success && fileUrl && loaded?.url !== fileUrl);

  useEffect(() => {
    const controller = new AbortController();
    if (result.success && fileUrl) {
      fetch(fileUrl, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch file");
          return res.text();
        })
        .then((content) => {
          if (!controller.signal.aborted)
            setLoaded({ url: fileUrl, content, error: null });
        })
        .catch((err) => {
          if (!controller.signal.aborted)
            setLoaded({
              url: fileUrl,
              content: null,
              error: err.message || "Error fetching file",
            });
        });
    }
    return () => controller.abort();
  }, [fileUrl, result.success]);

  if (!result.success) {
    return (
      <Card className="w-full bg-destructive/10 border-destructive/30">
        <CardContent className="pt-6">
          <p className="text-destructive font-medium">
            Error generating TXT file
          </p>
          <p className="text-sm text-destructive/80">
            {result.error || "Unknown error occurred"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  let displayText: string | JSX.Element = "TXT file generated.";
  if (fileUrl) {
    if (loading) {
      displayText = "Loading file contents...";
    } else if (fetchError) {
      displayText = fetchError;
    } else if (fileContent) {
      displayText = fileContent;
    }
  } else if (result.message) {
    displayText = result.message;
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-4 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 w-full">
            <h3 className="text-lg font-medium">Text File Generated</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!fileUrl}
              className="h-8 px-3 text-xs rounded-xl ml-auto"
            >
              <Download className="w-4 h-4" />{" "}
              <span className="hidden sm:block">Download</span>
            </Button>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div
            className={cn(
              "mb-4 whitespace-pre-wrap font-mono text-sm p-3 bg-muted/50 rounded-md overflow-auto",
              "max-h-[200px] md:max-h-[400px] scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
            )}
            style={{
              transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {loading ? (
              <p className="text-muted-foreground">Loading file contents...</p>
            ) : fetchError ? (
              <p className="text-destructive">{fetchError}</p>
            ) : (
              displayText
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TxtFileResult;
