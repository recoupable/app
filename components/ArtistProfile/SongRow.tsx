import { formatCompactNumber } from "@/lib/dates/formatCompactNumber";
import { formatUsdEstimate } from "@/lib/valuation/formatUsdEstimate";
import type { ArtistProfileSong } from "@/lib/recoup/getArtistProfile";

/**
 * One song in the catalog list: index, artwork (or a note-glyph tile),
 * title + ISRC, album, latest plays, and the model's mid $ estimate.
 */
const SongRow = ({ song, index }: { song: ArtistProfileSong; index: number }) => (
  <div className="grid grid-cols-[22px_36px_minmax(0,1fr)_74px] items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 hover:bg-muted md:grid-cols-[32px_44px_minmax(0,1fr)_220px_110px_110px] md:gap-3.5 md:px-4">
    <div className="font-mono text-[13px] text-muted-foreground md:text-sm">{index + 1}</div>
    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-secondary shadow-[0px_0px_0px_1px_var(--border)] md:h-11 md:w-11">
      {song.artwork_url ? (
        // Plain <img>: Apple artwork hosts are arbitrary for next/image's allowlist.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={song.artwork_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          className="text-muted-foreground"
          aria-hidden
        >
          <path d="M6 12.5V4l7-1.5v8.5" />
          <circle cx="4.5" cy="12.5" r="1.8" />
          <circle cx="11.5" cy="11" r="1.8" />
        </svg>
      )}
    </div>
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="truncate text-sm font-semibold md:text-[15px]">{song.name}</div>
      <div className="truncate font-mono text-[10px] tracking-wide text-muted-foreground md:text-[11px]">
        {song.isrc}
      </div>
    </div>
    <div className="hidden truncate text-sm text-muted-foreground md:block">{song.album}</div>
    <div className="hidden text-right font-mono text-sm md:block">
      {song.plays.toLocaleString("en-US")}
    </div>
    <div className="flex flex-col items-end gap-0.5 md:hidden">
      <span className="font-mono text-xs">{formatUsdEstimate(song.est_value_usd)}</span>
      <span className="font-mono text-[11px] text-muted-foreground">
        {formatCompactNumber(song.plays)}
      </span>
    </div>
    <div className="hidden text-right font-mono text-sm md:block">
      {formatUsdEstimate(song.est_value_usd)}
    </div>
  </div>
);

export default SongRow;
