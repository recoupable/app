import { useArtistProvider } from "@/providers/ArtistProvider";
import ImageWithFallback from "@/components/ImageWithFallback";
import ValuationHero from "@/components/Home/ValuationHero";
import useHomeValuation from "@/hooks/useHomeValuation";
import TasksModule from "@/components/Home/TasksModule";
import HomeSuggestedPrompts from "@/components/Home/HomeSuggestedPrompts";
import HomeValuationCta from "@/components/Valuation/HomeValuationCta";
import LogoIcon from "@/components/Logo/LogoIcon";
import styles from "./ChatGreeting.module.css";

/**
 * The empty chat's home header (recoupable/chat#1850), valuation first —
 * it's the headline number customers arrive with from the marketing
 * funnel: the artist-scoped catalog valuation hero when the account has
 * measured data for the current scope, otherwise the Sky welcome
 * panel plus a CTA into the valuation funnel; the "label at work"
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

  const fadeBase =
    "transition-opacity duration-200 motion-reduce:transition-none";
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

  return (
    <div className={`w-full ${fadeClass}`}>
      <section className={styles.hero} aria-label="Your music workspace">
        <div className={styles.eyebrow}>
          <LogoIcon className="h-5 w-auto" />
          <span>Your music. Your next move.</span>
        </div>
        <h1 className={styles.heading}>
          {isArtistSelected ? (
            <>
              What’s next for
              <br />
              <span className={styles.artist}>
                {artistImage && (
                  <span className={styles.avatar}>
                    <ImageWithFallback src={artistImage} />
                  </span>
                )}
                {artistName}?
              </span>
            </>
          ) : (
            <>
              A little more room
              <br />
              for your next big thing.
            </>
          )}
        </h1>
        <p className={styles.description}>
          Research your roster. Understand your catalog.{" "}
          <br className="hidden sm:block" />
          Turn the next idea into work done.
        </p>
      </section>
      <div className="mt-6 text-center">
        <HomeValuationCta />
      </div>
      <div className="mt-5 px-4 text-left text-sm">
        <TasksModule />
      </div>
      <div className="mt-4 px-4 text-sm">
        <HomeSuggestedPrompts />
      </div>
    </div>
  );
}

export default ChatGreeting;
