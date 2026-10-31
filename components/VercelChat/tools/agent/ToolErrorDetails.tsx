interface ToolErrorDetailsProps {
  error: string;
}

export function ToolErrorDetails({ error }: ToolErrorDetailsProps) {
  return (
    <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 font-mono text-xs leading-relaxed text-destructive-text">
      {error}
    </pre>
  );
}
