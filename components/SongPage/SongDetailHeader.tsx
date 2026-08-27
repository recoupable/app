import MusicStatusPill from "@/components/MusicPage/MusicStatusPill";
import type { MusicGeneration } from "@/types/Music";

/** Title, generation time and status for the song page. */
const SongDetailHeader = ({ generation }: { generation: MusicGeneration }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <h1 className="font-heading text-xl font-bold">Song details</h1>
      <p className="text-sm text-muted-foreground mt-0.5">
        Generated {new Date(generation.created_at).toLocaleString()}
      </p>
    </div>
    <MusicStatusPill status={generation.status} />
  </div>
);

export default SongDetailHeader;
