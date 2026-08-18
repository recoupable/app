import { notFound } from "next/navigation";
import type { Metadata } from "next";
import getArtistProfile from "@/lib/recoup/getArtistProfile";
import PublicHeader from "@/components/ArtistProfile/PublicHeader";
import ArtistHero from "@/components/ArtistProfile/ArtistHero";
import CatalogsSection from "@/components/ArtistProfile/CatalogsSection";
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
  if (!profile) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader />
      <ArtistHero profile={profile} />
      {profile.catalogs.length > 0 && <CatalogsSection catalogs={profile.catalogs} />}
      <PublicFooter />
    </div>
  );
};

export default ArtistProfilePage;
