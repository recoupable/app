"use client";
import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import type { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
export default function ReleaseTrackFilter({
  tracks,
  selected,
  onChange,
}: {
  tracks: ReturnType<typeof buildReleaseStreamSeries>["tracks"];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const unique = [
    ...new Map(tracks.filter((t) => t.isrc).map((t) => [t.isrc!, t])).values(),
  ];
  const filtered = unique.filter(
    (track) =>
      track.title.toLowerCase().includes(query.toLowerCase()) ||
      track.isrc!.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex min-w-48 h-10 cursor-pointer items-center justify-between gap-4 rounded-lg px-3 text-sm shadow-[0_0_0_1px_var(--input)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {selected.length
            ? `${selected.length} tracks selected`
            : "All tracks"}
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 max-w-[80vw] p-3 border-0 ring-1 ring-border"
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="pl-9"
            aria-label="Search tracks"
            placeholder="Search tracks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="my-2 flex justify-between text-xs">
          <span className="text-muted-foreground">Filter tracks</span>
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={() => onChange([])}
          >
            Reset to all tracks
          </button>
        </div>
        <div className="max-h-64 overflow-auto space-y-1">
          {filtered.map((t) => (
            <label
              key={t.isrc}
              className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={selected.includes(t.isrc!)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...selected, t.isrc!]
                      : selected.filter((id) => id !== t.isrc),
                  )
                }
              />
              <span className="min-w-0">
                <span className="block truncate">{t.title}</span>
                <span className="text-[10px] text-muted-foreground">
                  {t.isrc}
                </span>
              </span>
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground">
              No matching tracks.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
