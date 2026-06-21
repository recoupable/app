import { TrendingUp, Mic2 } from "lucide-react";
import { SpotifyArtistTopTracksResultType } from "@/types/spotify";
import SpotifyTrackCard from "./SpotifyTrackCard";
import { ToolCard, ToolCardBody } from "./shared/ToolCard";
import { ToolEmpty } from "./shared/ToolEmpty";

const SpotifyArtistTopTracksResult = ({
  result,
}: {
  result: SpotifyArtistTopTracksResultType;
}) => {
  const tracks = result.tracks ?? [];

  if (tracks.length === 0) {
    return (
      <ToolCard
        icon={TrendingUp}
        tone="success"
        title="Top tracks"
        subtitle="No tracks"
      >
        <ToolEmpty
          icon={Mic2}
          title="No top tracks available"
          description="We couldn't find popular tracks for this artist on Spotify."
        />
      </ToolCard>
    );
  }

  return (
    <ToolCard
      icon={TrendingUp}
      tone="success"
      title="Top tracks"
      subtitle={`${tracks.length} popular track${tracks.length === 1 ? "" : "s"}`}
    >
      <ToolCardBody>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4">
          {tracks.map((track) => (
            <SpotifyTrackCard key={track.id} track={track} />
          ))}
        </div>
      </ToolCardBody>
    </ToolCard>
  );
};

export default SpotifyArtistTopTracksResult;
