import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { useReleaseCases } from "@/hooks/useReleaseCases";
export default function ReleaseCasesList({
  cases,
}: {
  cases: ReturnType<typeof useReleaseCases>;
}) {
  return (
    <>
      {cases.loaded && !cases.error && cases.items.length === 0 && (
        <div className="rounded-xl p-6 shadow-[0_0_0_1px_var(--border)]">
          <p>No saved releases yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask Recoup to gather a release in this workspace, then return here
            to review its evidence.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Open chat</Link>
          </Button>
        </div>
      )}
      <ul className="space-y-2">
        {cases.items.map((item) => (
          <li key={item.request_id}>
            <Button
              variant="outline"
              className="h-auto min-h-11 w-full flex-col items-start justify-start whitespace-normal text-left sm:flex-row sm:items-center"
              disabled={cases.busy}
              onClick={() => void cases.open(item.request_id)}
              aria-label={`Open saved release ${item.url}`}
            >
              <span className="min-w-0 break-all">{item.url}</span>
              <span className="shrink-0 text-xs text-muted-foreground sm:ml-auto sm:pl-3">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </Button>
          </li>
        ))}
      </ul>
      {cases.nextId && (
        <Button
          variant="outline"
          disabled={cases.busy}
          onClick={() => void cases.more()}
        >
          Load more releases
        </Button>
      )}
    </>
  );
}
