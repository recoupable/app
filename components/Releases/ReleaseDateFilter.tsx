"use client";
import { useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
export default function ReleaseDateFilter({
  data,
}: {
  data: ReturnType<typeof useReleaseStreams>;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  const [latest] = useState(() =>
    new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
  );
  const apply = () => {
    const days = (Date.parse(end) - Date.parse(start)) / 86400000 + 1;
    if (
      !start ||
      !end ||
      !Number.isInteger(days) ||
      days < 1 ||
      days > 366 ||
      end > latest
    ) {
      setError(
        "Choose 1–366 completed days, ending before the reporting buffer.",
      );
      return;
    }
    setError("");
    data.setRange(start, days);
    if (menu.current) menu.current.open = false;
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label="Stream period"
        className="flex rounded-lg bg-muted p-1"
      >
        {[7, 28, 90, 365].map((days) => (
          <button
            key={days}
            type="button"
            aria-label={`Last ${days} days`}
            aria-pressed={!data.since && data.days === days}
            onClick={() => data.setDays(days)}
            className={`h-8 min-w-11 rounded-md px-3 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring ${!data.since && data.days === days ? "bg-background shadow-sm" : "text-muted-foreground"}`}
          >
            {days === 365 ? "1Y" : `${days}D`}
          </button>
        ))}
      </div>
      <details ref={menu} className="relative">
        <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-lg px-3 text-sm shadow-[0_0_0_1px_var(--input)] focus-visible:ring-2 focus-visible:ring-ring">
          <CalendarDays className="size-4" aria-hidden="true" />
          {data.since ? "Custom range" : "Dates"}
        </summary>
        <div className="absolute right-0 top-12 z-20 w-72 rounded-xl bg-popover p-4 shadow-lg ring-1 ring-border">
          <label className="block text-xs">
            From
            <Input
              aria-label="Start date"
              type="date"
              max={latest}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="mt-3 block text-xs">
            To
            <Input
              aria-label="End date"
              type="date"
              max={latest}
              min={start}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            UTC dates · latest available {latest}
          </p>
          {error && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <Button size="sm" className="mt-3 w-full" onClick={apply}>
            Apply dates
          </Button>
        </div>
      </details>
    </div>
  );
}
