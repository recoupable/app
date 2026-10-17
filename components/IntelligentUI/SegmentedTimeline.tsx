import { formatTime } from "@/lib/intelligent-ui/representations/formatTime";
import { getActiveSection } from "@/lib/intelligent-ui/representations/getActiveSection";
import type { TimelineComponent } from "@/lib/intelligent-ui/representations/schemas";

export default function SegmentedTimeline({
  component,
  position,
  onSeek,
  descriptionId,
  playbackAvailable,
}: {
  component: TimelineComponent;
  position: number;
  onSeek: (position: number) => void;
  descriptionId: string;
  playbackAvailable: boolean;
}) {
  const active = getActiveSection(component, position);
  return (
    <div className="mt-5">
      <div
        role="group"
        aria-label="Explore sections"
        className="grid grid-cols-1 gap-1.5 @min-[110px]:grid-cols-2 @min-[250px]:flex @min-[250px]:flex-wrap"
      >
        {component.sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSeek(section.start)}
            aria-current={active?.id === section.id ? "true" : undefined}
            aria-controls={descriptionId}
            aria-label={`${section.label}, ${formatTime(section.start)} to ${formatTime(section.end)}`}
            className={`relative min-h-16 min-w-11 cursor-pointer overflow-hidden rounded-lg px-1 py-2 text-center outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring ${active?.id === section.id ? "bg-accent text-accent-foreground shadow-[inset_0_0_0_1px_var(--brand-link)]" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}
            style={{ flexGrow: section.end - section.start, flexBasis: 0 }}
          >
            <span className="block text-xs font-medium break-words">
              {section.label}
            </span>
            <span className="mt-1 block font-mono text-[10px] tabular-nums">
              {formatTime(section.start)}
            </span>
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-0.5 bg-brand-link"
              style={{
                width: `${Math.max(0, Math.min(1, (position - section.start) / (section.end - section.start))) * 100}%`,
              }}
            />
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-xs leading-5 text-muted-foreground">
        {playbackAvailable
          ? "Choose a section to jump. Playback starts when you press play."
          : "Choose a section to read its notes."}
      </p>
    </div>
  );
}
