import Link from "next/link";
import { Disc3, ChevronRight } from "lucide-react";
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
            Add a release URL above, or ask Recoup to help gather its metadata.
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
              className={`h-auto min-h-20 w-full justify-start gap-3 whitespace-normal rounded-xl p-4 text-left ${cases.current?.request_id === item.request_id ? "bg-muted shadow-[0_0_0_2px_var(--foreground)]" : ""}`}
              disabled={cases.busy}
              onClick={() => void cases.open(item.request_id)}
              aria-label={`Open saved release ${item.url}`}
            >
              <Disc3
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">Spotify release</span>
                <span className="block text-xs text-muted-foreground">
                  Added {new Date(item.created_at).toLocaleDateString()}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {item.url.replace("https://open.spotify.com/", "")}
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
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
