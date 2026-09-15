import { ArrowUpRight, Disc3, Mic2 } from "lucide-react";
import AddCatalogButton from "@/components/Catalog/AddCatalogButton";
import { useArtistProvider } from "@/providers/ArtistProvider";
import ImageWithFallback from "@/components/ImageWithFallback";
import ValuationHero from "@/components/Home/ValuationHero";
import useHomeValuation from "@/hooks/useHomeValuation";
import HomeSuggestedPrompts from "@/components/Home/HomeSuggestedPrompts";
import { useOrganization } from "@/providers/OrganizationProvider";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";
import LogoIcon from "@/components/Logo/LogoIcon";
import styles from "./ChatGreeting.module.css";

/** Home follows the selected workspace and artist; account-wide task runs live on Tasks. */
export function ChatGreeting({ isVisible }: { isVisible: boolean }) {
  const { selectedArtist, artists, isLoading, isError, toggleCreation } =
    useArtistProvider();
  const valuation = useHomeValuation();
  const { selectedOrgId } = useOrganization();
  const { data: organizations = [] } = useAccountOrganizations();
  const workspaceName = selectedOrgId
    ? organizations.find((org) => org.organization_id === selectedOrgId)
        ?.organization_name || "Your organization"
    : "Your workspace";
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
        <HomeSuggestedPrompts />
      </div>
    );
  }

  return (
    <div className={`w-full ${fadeClass}`}>
      <section className={styles.hero} aria-label="Your music workspace">
        <div className={styles.eyebrow}>
          <LogoIcon className="h-5 w-auto" />
          <span>{isArtistSelected ? "Artist workspace" : workspaceName}</span>
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
              {artists.length
                ? "What’s next for your roster?"
                : "What would you like to work on?"}
            </>
          )}
        </h1>
        <p className={styles.description}>
          {isArtistSelected
            ? `Research ${artistName}, plan a release, or put an idea to work.`
            : isLoading
              ? "Loading your roster…"
              : isError
                ? "Your roster couldn’t load. Try again in a moment."
                : artists.length
                  ? `${artists.length} artists. Work across your roster, or choose an artist above to focus.`
                  : "Add an artist or catalog, or start with a question."}
        </p>
      </section>
      {!isArtistSelected && !isLoading && !isError && !artists.length && (
        <div className={styles.actions} role="group" aria-label="Get started">
          <button
            type="button"
            onClick={toggleCreation}
            className={styles.actionCard}
          >
            <span className={styles.actionIcon}>
              <Mic2 aria-hidden="true" />
            </span>
            <span className={styles.actionCopy}>
              <span className={styles.actionTitle}>Add artist</span>
              <span className={styles.actionDescription}>
                Connect an artist from Spotify.
              </span>
            </span>
            <ArrowUpRight className={styles.actionArrow} aria-hidden="true" />
          </button>
          <AddCatalogButton className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <Disc3 aria-hidden="true" />
            </span>
            <span className={styles.actionCopy}>
              <span className={styles.actionTitle}>Add catalog</span>
              <span className={styles.actionDescription}>
                Upload your songs from a CSV.
              </span>
            </span>
            <ArrowUpRight className={styles.actionArrow} aria-hidden="true" />
          </AddCatalogButton>
        </div>
      )}
      <div className="mt-4 px-4 text-sm">
        <HomeSuggestedPrompts />
      </div>
    </div>
  );
}

export default ChatGreeting;
