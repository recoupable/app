import { Button } from "@/components/ui/button";
interface Props {
  version: number;
  changes: string[];
  disabled: boolean;
  onSave: () => void;
}
export default function ReleasePlanReview({
  version,
  changes,
  disabled,
  onSave,
}: Props) {
  return (
    <section
      aria-label="Proposed local version"
      className="space-y-3 rounded-xl border border-border p-4"
    >
      <h3 className="font-medium">Review local version {version + 1}</h3>
      {changes.length ? (
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
          {changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm">
          No changes from{" "}
          {version
            ? "the saved version. Saving again will not create a duplicate."
            : "the example defaults. This will create the first local version."}
        </p>
      )}
      <p className="text-sm">
        Only this tab&apos;s plan is saved. Pending tasks stay pending.
      </p>
      <Button
        type="button"
        disabled={disabled}
        onClick={onSave}
        className="min-h-11"
      >
        Save local version
      </Button>
    </section>
  );
}
