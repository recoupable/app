import { SpotifyTrackSearchResult } from "@/types/spotify";
import SpotifyContentCard from "./SpotifyContentCard";

const SpotifyTrackCard = ({ track }: { track: SpotifyTrackSearchResult }) => {
  return <SpotifyContentCard content={track} />;
};

export default SpotifyTrackCard;
