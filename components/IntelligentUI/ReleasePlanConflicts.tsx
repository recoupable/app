interface Props {
  conflicts: string[];
}
export default function ReleasePlanConflicts({ conflicts }: Props) {
  if (!conflicts.length) return null;
  return (
    <div role="alert" className="space-y-2 text-sm text-destructive-text">
      <p>Resolve these conflicts before saving:</p>
      <ul className="list-disc pl-5">
        {conflicts.map((conflict) => (
          <li key={conflict}>{conflict}</li>
        ))}
      </ul>
    </div>
  );
}
