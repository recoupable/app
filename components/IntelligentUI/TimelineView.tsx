"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { TimelineComponent } from "@/lib/intelligent-ui/representations/schemas";
import { getActiveSection } from "@/lib/intelligent-ui/representations/getActiveSection";
import { getTimelineStateKey } from "@/lib/intelligent-ui/representations/getTimelineStateKey";
import { useTimelinePosition } from "@/lib/intelligent-ui/representations/useTimelinePosition";
import { getRepresentationText } from "@/lib/intelligent-ui/representations/getRepresentationText";
import { formatTime } from "@/lib/intelligent-ui/representations/formatTime";
import SegmentedTimeline from "./SegmentedTimeline";

export default function TimelineView({
  component,
  scope,
  audioUrl,
}: {
  component: TimelineComponent;
  scope: string;
  audioUrl?: string;
}) {
  const id = useId();
  const audio = useRef<HTMLAudioElement>(null);
  const pendingSeek = useRef<number | null>(null);
  const { position, setPosition, restored } = useTimelinePosition(
    getTimelineStateKey(component, scope),
    component.durationSeconds,
  );
  const [unavailable, setUnavailable] = useState(!audioUrl);
  const section = getActiveSection(component, position);
  useEffect(() => {
    const element = audio.current;
    return () => element?.pause();
  }, [restored, audioUrl, unavailable]);
  const seek = (value: number) => {
    const next = Math.max(0, Math.min(component.durationSeconds, value));
    pendingSeek.current = next;
    setPosition(next);
    if (audio.current && audio.current.readyState > 0 && !unavailable) {
      try {
        audio.current.currentTime = next;
        pendingSeek.current = null;
      } catch {
        audio.current.pause();
        setUnavailable(true);
      }
    }
  };
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="@container rounded-2xl bg-card p-4 shadow-[0_0_0_1px_var(--border)] sm:p-6"
    >
      <h2 id={`${id}-title`} className="text-lg font-medium tracking-tight">
        {component.title}
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {component.media?.label ??
          `Section notes · ${formatTime(component.durationSeconds)}`}
      </p>
      {restored && audioUrl && !unavailable && (
        <audio
          ref={audio}
          controls
          preload="metadata"
          src={audioUrl}
          aria-label={component.media?.label ?? component.title}
          className="mt-5 h-11 w-full"
          onLoadedMetadata={() => {
            const element = audio.current;
            if (
              !element ||
              !Number.isFinite(element.duration) ||
              Math.abs(element.duration - component.durationSeconds) > 0.1
            ) {
              element?.pause();
              setUnavailable(true);
              return;
            }
            try {
              element.currentTime = pendingSeek.current ?? position;
              pendingSeek.current = null;
            } catch {
              element.pause();
              setUnavailable(true);
            }
          }}
          onTimeUpdate={() => {
            const value = audio.current?.currentTime;
            if (
              value !== undefined &&
              Number.isFinite(value) &&
              pendingSeek.current === null
            )
              setPosition(
                Math.max(0, Math.min(component.durationSeconds, value)),
              );
          }}
          onError={() => setUnavailable(true)}
        />
      )}
      {component.media && unavailable && (
        <p
          role="status"
          className="mt-4 text-sm leading-6 text-muted-foreground"
        >
          Audio is unavailable here. You can still explore the supplied section
          notes.
        </p>
      )}
      <SegmentedTimeline
        component={component}
        position={position}
        onSeek={seek}
        descriptionId={`${id}-explanation`}
        playbackAvailable={Boolean(restored && audioUrl && !unavailable)}
      />
      <div
        id={`${id}-explanation`}
        role="region"
        aria-labelledby={`${id}-section-title`}
        className="mt-6 min-h-52 @min-[300px]:min-h-40 @min-[500px]:min-h-28"
      >
        <div className="flex items-baseline gap-3">
          <h3 id={`${id}-section-title`} className="text-sm font-medium">
            {section?.label ?? "Between sections"}
          </h3>
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {section
              ? `${formatTime(section.start)}–${formatTime(section.end)}`
              : formatTime(position)}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {section?.description ??
            "No annotation was supplied for this interval."}
        </p>
      </div>
      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="w-fit cursor-pointer rounded-lg py-3 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          Read all section notes
        </summary>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
          {getRepresentationText(component)}
        </p>
      </details>
    </section>
  );
}
