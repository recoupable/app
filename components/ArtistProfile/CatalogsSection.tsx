import CatalogCard from "./CatalogCard";
import { VALUATION_URL } from "@/lib/consts";
import type { ArtistProfileCatalog } from "@/lib/recoup/getArtistProfile";

/**
 * The CATALOGS grid: one card per linked catalog plus the valuation CTA
 * card from the approved design. Rendered only when the artist has catalogs.
 */
const CatalogsSection = ({ catalogs }: { catalogs: ArtistProfileCatalog[] }) => (
  <section className="flex flex-col gap-4 px-5 pb-12 md:gap-5 md:px-12 md:pb-16">
    <div className="flex items-baseline gap-3">
      <h2 className="font-mono text-lg font-bold uppercase tracking-wide md:text-2xl">
        Catalogs
      </h2>
      <span className="text-sm text-muted-foreground">{catalogs.length}</span>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
      {catalogs.map((catalog) => (
        <CatalogCard key={catalog.id} catalog={catalog} />
      ))}
      <a
        href={VALUATION_URL}
        className="flex items-center justify-center rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground shadow-[0px_0px_0px_1px_var(--border)] transition-colors hover:text-foreground"
      >
        Get a free valuation for this catalog →
      </a>
    </div>
  </section>
);

export default CatalogsSection;
