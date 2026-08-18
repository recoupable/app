import { formatMonthYear } from "@/lib/utils/formatMonthYear";
import type { ArtistProfileCatalog } from "@/lib/recoup/getArtistProfile";

/**
 * One linked catalog: name, song count, and when it last changed.
 */
const CatalogCard = ({ catalog }: { catalog: ArtistProfileCatalog }) => {
  const updated = formatMonthYear(catalog.updated_at);
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-background p-6 shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 truncate text-[17px] font-semibold">{catalog.name}</div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="shrink-0 text-muted-foreground"
          aria-hidden
        >
          <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" />
        </svg>
      </div>
      <div className="flex gap-3.5 text-[13px] text-muted-foreground">
        <span>
          {catalog.song_count} {catalog.song_count === 1 ? "song" : "songs"}
        </span>
        {updated && <span>Updated {updated}</span>}
      </div>
    </div>
  );
};

export default CatalogCard;
