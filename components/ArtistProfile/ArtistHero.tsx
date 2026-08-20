import SocialChip from "./SocialChip";
import ValuationBadge from "./ValuationBadge";
import ValuationRunStatusChip from "@/components/Valuation/ValuationRunStatusChip";
import type { ArtistProfile } from "@/lib/recoup/getArtistProfile";

/**
 * Hero of the public artist page: image (or an initial tile when none is
 * set), the ARTIST label, the display name, and the social chips row.
 */
const ArtistHero = ({ profile }: { profile: ArtistProfile }) => (
  <section className="flex flex-col items-center gap-5 px-5 py-10 md:flex-row md:items-center md:gap-14 md:px-12 md:py-16">
    <div className="relative flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-foreground shadow-[0px_0px_0px_1px_var(--border),0px_4px_8px_rgba(0,0,0,0.06)] md:h-80 md:w-80">
      {profile.image ? (
        // Plain <img>: artist images come from arbitrary hosts, which
        // next/image's remotePatterns allowlist would reject.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.image}
          alt={profile.name ?? "Artist"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-mono text-6xl font-bold text-background md:text-8xl">
          {(profile.name ?? "?").charAt(0).toUpperCase()}
        </span>
      )}
    </div>
    <div className="flex min-w-0 flex-col items-center gap-4 md:items-start md:gap-5">
      <div className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground md:text-xs">
        Artist
      </div>
      <h1 className="break-words text-center font-mono text-4xl font-bold uppercase leading-[1.05] tracking-tight md:text-left md:text-7xl">
        {profile.name}
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        {profile.valuation && <ValuationBadge valuation={profile.valuation} />}
        <ValuationRunStatusChip />
      </div>
      {profile.socials.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 md:justify-start md:gap-2.5">
          {profile.socials.map((social) => (
            <SocialChip key={social.profile_url} social={social} />
          ))}
        </div>
      )}
    </div>
  </section>
);

export default ArtistHero;
