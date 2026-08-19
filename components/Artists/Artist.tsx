import Link from "next/link";
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
      {artist.id && (
        <Link
          href={`/artists/${artist.id}`}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-90 transition-opacity hover:opacity-100"
        >
          <span>View profile</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" />
          </svg>
        </Link>
      )}
      {isVisibleDropDown && <DropDown artist={artist} />}
    </div>
  );
};

export default Artist;
