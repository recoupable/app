interface Props {
  text: string;
  hasValidInputs: boolean;
}
export default function ReleasePlanReadable({ text, hasValidInputs }: Props) {
  return (
    <details open>
      <summary className="min-h-11 cursor-pointer py-2 text-sm">
        Readable plan
      </summary>
      <p className="mb-2 text-sm text-muted-foreground">
        {hasValidInputs
          ? "Working copy; only explicit Save stores a version."
          : "Last valid saved plan or example defaults; current inputs need correction."}
      </p>
      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6">
        {text}
      </pre>
    </details>
  );
}
