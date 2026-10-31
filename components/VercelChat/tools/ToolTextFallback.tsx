import { FileText } from "lucide-react";
import { ToolLayout } from "./agent/ToolLayout";

interface ToolTextFallbackProps {
  name: string;
  text?: string;
  error?: string;
}

/** A display fallback describes the response, not whether the operation succeeded. */
export default function ToolTextFallback({
  name,
  text,
  error,
}: ToolTextFallbackProps) {
  const responseText = error ?? text;
  return (
    <div role="group" aria-label={`Response from ${name}`}>
      <ToolLayout
        name={error ? "Tool failed" : "Tool response"}
        summary={
          responseText === undefined ? "No text response available" : name
        }
        state={{ running: false, interrupted: false, error }}
        icon={<FileText className="h-3.5 w-3.5" />}
        expandedContent={
          responseText === undefined ? undefined : (
            <pre
              role="region"
              aria-label="Tool response text"
              tabIndex={0}
              className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/40 px-3 py-2 font-mono text-xs leading-5 [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {responseText}
            </pre>
          )
        }
      />
    </div>
  );
}
