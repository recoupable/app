import { notFound } from "next/navigation";
import type { Metadata } from "next";
import getArtistProfile from "@/lib/recoup/getArtistProfile";
import ArtistHero from "@/components/ArtistProfile/ArtistHero";
import SongsSection from "@/components/ArtistProfile/SongsSection";
import PublicFooter from "@/components/ArtistProfile/PublicFooter";

type Params = { params: Promise<{ id: string }> };

/**
 * SEO/unfurl metadata for the public artist page. A 404ing id falls back to
 * the app default so crawlers see nothing artist-specific.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const profile = await getArtistProfile(id);
  if (!profile?.name) return {};
  return {
    title: `${profile.name} — Recoupable`,
    description: `${profile.name} on Recoupable: connected socials and music catalogs.`,
    openGraph: {
      title: `${profile.name} — Recoupable`,
      ...(profile.image ? { images: [profile.image] } : {}),
    },
  };
}

/**
 * Public artist profile at /artists/[id] — name, image, connected socials,
 * and linked catalogs. Server-rendered from the unauthenticated
 * GET /api/artists/{id}/profile endpoint; no account required to view.
 */
const ArtistProfilePage = async ({ params }: Params) => {
  const { id } = await params;
  const profile = await getArtistProfile(id);
  // The root layout streams, so the HTTP status commits as 200 before this
  // resolves; notFound() renders the 404 UI with a robots noindex meta —
  // Next's designed fallback — which keeps unknown ids out of search indexes.
  if (!profile) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ArtistHero profile={profile} />
      <SongsSection catalogs={profile.catalogs} artistId={profile.id} socials={profile.socials} />
      <PublicFooter />
    </div>
  );
};

export default ArtistProfilePage;
