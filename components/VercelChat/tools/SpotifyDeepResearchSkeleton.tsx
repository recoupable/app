import { Mic2 } from "lucide-react";
import { ToolCard, ToolCardBody } from "./shared/ToolCard";

export default function SpotifyDeepResearchSkeleton() {
  return (
    <ToolCard
      icon={Mic2}
      tone="success"
      loading
      title="Spotify deep research"
      subtitle="Researching artist…"
    >
      <ToolCardBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3"
            >
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-3 w-12 animate-pulse rounded bg-muted/70" />
            </div>
          ))}
        </div>
      </ToolCardBody>
    </ToolCard>
  );
}
