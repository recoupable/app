import SongModal from "@/components/SongPage/SongModal";

/**
 * Intercepts /music/{id} when navigated to from inside the app.
 *
 * The URL becomes the song's own, so it can be copied or refreshed, but the
 * gallery stays mounted underneath and closing returns to it with scroll
 * intact. A direct load or a refresh skips this and renders
 * `app/music/[id]/page.tsx` instead.
 */
const InterceptedSongPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <SongModal generationId={id} />;
};

export default InterceptedSongPage;
