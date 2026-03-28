import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import FilePreviewSkeleton from "./FilePreviewSkeleton";

type FilePreviewProps = {
  content: string | null;
  loading: boolean;
  error: string | null;
  isTextFile: boolean;
  fileName?: string;
  imageUrl?: string;
};

export default function FilePreview({
  content,
  loading,
  error,
  isTextFile,
  fileName,
  imageUrl,
}: FilePreviewProps) {
  if (loading) {
    return <FilePreviewSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] border border-border rounded-lg bg-background">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="flex-1 border border-border rounded-lg bg-background overflow-hidden flex items-center justify-center min-h-[300px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={fileName || "Image preview"}
          className="max-w-full max-h-[70vh] object-contain"
        />
      </div>
    );
  }

  if (!isTextFile) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] border-2 border-dashed border-border rounded-lg">
        <p className="text-sm text-muted-foreground">
          Preview not available for this file type
        </p>
      </div>
    );
  }

  // Check if file is markdown
  const lowerFileName = fileName?.toLowerCase() ?? "";
  const isMarkdown =
    lowerFileName.endsWith(".md") || lowerFileName.endsWith(".markdown");

  // Limit preview size for performance (10MB - matches upload limit)
  const MAX_PREVIEW_SIZE = 10 * 1024 * 1024;
  const contentToShow =
    content && content.length > MAX_PREVIEW_SIZE
      ? content.substring(0, MAX_PREVIEW_SIZE) +
        "\n\n...(content truncated for preview)"
      : content;

  return (
    <div className="flex-1 border border-border rounded-lg bg-background overflow-hidden flex flex-col">
      <div className="overflow-auto flex-1 p-6 sm:p-8">
        {isMarkdown ? (
          <article
            className="prose prose-sm sm:prose lg:prose-base max-w-none dark:prose-invert
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-0 prose-h1:pb-2 prose-h1:border-b prose-h1:border-border
            prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/50
            prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
            prose-p:text-base prose-p:leading-relaxed prose-p:my-4
            prose-ul:my-4 prose-ul:space-y-2 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-4 prose-ol:space-y-2 prose-ol:list-decimal prose-ol:pl-6
            prose-li:my-0 prose-li:text-base prose-li:leading-relaxed
            prose-strong:font-semibold prose-strong:text-foreground
            prose-em:italic
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg
            prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                a: ({ ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {contentToShow || ""}
            </ReactMarkdown>
          </article>
        ) : (
          <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">
            {contentToShow}
          </pre>
        )}
      </div>
    </div>
  );
}
