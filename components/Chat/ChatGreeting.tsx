import { useArtistProvider } from "@/providers/ArtistProvider";
import ImageWithFallback from "@/components/ImageWithFallback";
import ValuationHero from "@/components/Home/ValuationHero";
import HomeCatalogCta from "@/components/Home/HomeCatalogCta";
import useHomeValuation from "@/hooks/useHomeValuation";
import TasksModule from "@/components/Home/TasksModule";
import HomeSuggestedPrompts from "@/components/Home/HomeSuggestedPrompts";

/**
 * The empty chat's home header (recoupable/chat#1850), valuation first —
 * it's the headline number customers arrive with from the marketing
 * funnel: the artist-scoped catalog valuation hero when the account has
 * measured data for the current scope, otherwise the "Ask me about"
 * greeting plus either the claimed-catalog card (recoupable/chat#1867) or,
 * with nothing claimed, a CTA into the valuation funnel; the "label at work"
 * tasks module and the suggested prompt chips render beneath it (each
 * self-hiding when it has nothing to show). All context arrives via provider-backed hooks — no props beyond
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
      <div className={`mb-6 mt-4 flex flex-col gap-4 py-3 ${fadeClass}`}>
        <ValuationHero
          artistName={valuation.artistName}
          artistImage={valuation.artistImage}
          valuation={valuation.valuation}
          measuredTrackCount={valuation.measuredTrackCount}
        />
        <TasksModule />
        <HomeSuggestedPrompts />
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
      <HomeCatalogCta />
      <div className="text-left text-sm font-normal tracking-normal">
        <TasksModule />
      </div>
      <div className="mt-4 text-sm font-normal tracking-normal">
        <HomeSuggestedPrompts />
      </div>
    </div>
  );
}

export default ChatGreeting;
