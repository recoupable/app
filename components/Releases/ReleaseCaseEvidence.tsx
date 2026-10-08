import type { ReleaseCase } from "@/lib/releases/types";
export default function ReleaseCaseEvidence({
  current,
}: {
  current: ReleaseCase;
}) {
  return (
    <details>
      <summary className="cursor-pointer py-2 font-medium">
        Evidence versions ({current.evidence_manifest.length})
      </summary>
      <ul className="space-y-3 text-sm">
        {current.evidence_manifest.map((source) => (
          <li key={`${source.result_id}:${source.source_version_id}`}>
            <p className="break-all">{source.source_url}</p>
            <p className="text-muted-foreground">
              Captured {new Date(source.retrieved_at).toLocaleString()}
            </p>
            <code className="break-all text-xs">
              {source.source_version_id}
            </code>
          </li>
        ))}
      </ul>
    </details>
  );
}
