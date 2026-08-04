import { useArtistProvider } from "@/providers/ArtistProvider";
import { ArtistRecord } from "@/types/Artist";
import ImageWithFallback from "../ImageWithFallback";
import DropDown from "./DropDown";

const Artist = ({
  artist,
  isVisibleDropDown,
}: {
  artist: ArtistRecord;
  isVisibleDropDown: boolean;
}) => {
  const { setSelectedArtist, setMenuVisibleArtistId } = useArtistProvider();

  const handleClick = () => {
    setMenuVisibleArtistId(null);
    setSelectedArtist(artist);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDropDown = (e: any) => {
    e.preventDefault();
    setMenuVisibleArtistId(artist.id ?? null);
  };

  return (
    <div className="relative" id={artist.id}>
      <button
        type="button"
        className="w-[335px] h-[162px] overflow-hidden rounded-xl relative border-grey border"
        onClick={handleClick}
        onContextMenu={handleDropDown}
      >
        <ImageWithFallback
          src={artist.image || "https://i.imgur.com/QCdc8Ai.jpg"}
        />
        <div className="rounded-full flex items-center justify-center text-white absolute left-4 bottom-4">
          {artist.name}
        </div>
      </button>
      {isVisibleDropDown && <DropDown artist={artist} />}
    </div>
  );
};

export default Artist;
