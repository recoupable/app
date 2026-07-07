import { useArtistProvider } from "@/providers/ArtistProvider";
import ImageWithFallback from "@/components/ImageWithFallback";
import ValuationHero from "@/components/Home/ValuationHero";
import useHomeValuation from "@/hooks/useHomeValuation";
import { VALUATION_URL } from "@/lib/consts";

/**
 * The empty chat's artist header (recoupable/chat#1850): the artist-scoped
 * catalog valuation hero when the account has measured data for the current
 * scope, otherwise the "Ask me about" greeting plus a CTA into the valuation
 * funnel. All context arrives via provider-backed hooks — no props beyond
 * the fade flag the chat empty state already owned, so the chat component
 * needs no knowledge of what this header shows.
 */
export function ChatGreeting({ isVisible }: { isVisible: boolean }) {
  const { selectedArtist } = useArtistProvider();
  const valuation = useHomeValuation();
  const artistName = selectedArtist?.name || "";
  const artistImage = selectedArtist?.image || "";
  const isArtistSelected = !!selectedArtist;

  const fadeBase = "transition-opacity duration-700 ease-out";
  const fadeClass = `${fadeBase} ${isVisible ? "opacity-100" : "opacity-0"}`;

  if (valuation.show) {
    return (
      <div className={`mb-6 mt-4 py-3 ${fadeClass}`}>
        <ValuationHero
          artistName={valuation.artistName}
          artistImage={valuation.artistImage}
          valuation={valuation.valuation}
          measuredTrackCount={valuation.measuredTrackCount}
        />
      </div>
    );
  }

  const textStyle = `
    font-heading
    text-[20px]
    sm:text-[24px]
    lg:text-[28px]
    leading-[1.4]
    sm:leading-[1.3]
    lg:leading-[1.3]
    tracking-[-0.02em]
    font-medium
  `;

  return (
    <div
      className={`${textStyle} mb-6 mt-4 py-3 ${fadeClass} text-center w-full`}
    >
      <span className="text-foreground font-medium inline-flex items-center gap-3 flex-wrap justify-center">
        Ask me about{" "}
        {isArtistSelected && artistImage && (
          <span className="inline-block w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-foreground shadow-md">
            <ImageWithFallback src={artistImage} />
          </span>
        )}
        {isArtistSelected ? artistName : "your roster"}
      </span>
      <div className="mt-4">
        <a
          href={VALUATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-card px-4 py-2 text-sm font-normal text-muted-foreground shadow-[0px_0px_0px_1px_var(--border)] transition-colors hover:text-foreground"
        >
          Get a free catalog valuation &rarr;
        </a>
      </div>
    </div>
  );
}

export default ChatGreeting;
