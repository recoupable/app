import { z } from "zod";
import { requestStreamData } from "./requestStreamData";
const schema = z.object({
  status: z.literal("success"),
  songs: z.array(
    z.object({
      catalog_id: z.string(),
      isrc: z.string(),
      name: z.string().nullable(),
      album: z.string().nullable(),
    }),
  ),
  pagination: z.object({
    total_count: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.literal(100),
    total_pages: z.number().int().nonnegative(),
  }),
});
/** Read the existing catalog completely; a partial page must never become a release total. */
export async function getReleaseCatalogSongs(
  catalogId: string,
  getAccessToken: () => Promise<string | null>,
  signal: AbortSignal,
) {
  const read = async (page: number) => {
    const query = new URLSearchParams({
      catalog_id: catalogId,
      page: String(page),
      limit: "100",
    });
    const result = schema.parse(
      await requestStreamData(
        `catalogs/songs?${query}`,
        getAccessToken,
        signal,
      ),
    );
    if (
      result.songs.some((song) => song.catalog_id !== catalogId) ||
      result.songs.length !==
        Math.min(
          100,
          Math.max(0, result.pagination.total_count - (page - 1) * 100),
        ) ||
      result.pagination.page !== page ||
      result.pagination.total_pages !==
        Math.ceil(result.pagination.total_count / 100)
    )
      throw new Error("Catalog changed while loading. Please retry.");
    return result;
  };
  const first = await read(1);
  if (first.pagination.total_count > 250)
    throw new Error(
      "Charts currently support catalogs with up to 250 recordings.",
    );
  const results = [first];
  for (let page = 2; page <= first.pagination.total_pages; page++)
    results.push(await read(page));
  if (
    results.some(
      (result) =>
        result.pagination.total_count !== first.pagination.total_count,
    )
  )
    throw new Error("Catalog changed while loading. Please retry.");
  const songs = results.flatMap((result) => result.songs);
  if (
    songs.length !== first.pagination.total_count ||
    new Set(songs.map((song) => song.isrc)).size !== songs.length
  )
    throw new Error("Catalog coverage changed while loading. Please retry.");
  return songs;
}
