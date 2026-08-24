import SongDetail from "@/components/SongPage/SongDetail";

/**
 * GET /music/{id} — one song at its own shareable URL.
 *
 * Rendered on a direct load, a refresh, or a pasted link. Navigating here from
 * the gallery is intercepted by `app/@modal/(.)music/[id]`, which shows the
 * same content in a dialog without leaving the page.
 */
const SongPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <SongDetail generationId={id} />
    </div>
  );
};

export default SongPage;
