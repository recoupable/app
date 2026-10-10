import { requestStreamData } from "./requestStreamData";
import { streamHistorySchema } from "./streamTypes";

/** Fetch every catalog page within the 250-recording tracking scope; never sum a truncated page. */
export async function getReleaseStreamHistory(
  catalogId: string,
  period: { since: string; days: number },
  getAccessToken: () => Promise<string | null>,
  signal: AbortSignal,
) {
  const read = async (page: number) => {
    const query = new URLSearchParams({
      since: period.since,
      days: String(period.days),
      page: String(page),
      limit: "25",
    });
    const result = streamHistorySchema.parse(
      await requestStreamData(
        `catalogs/${encodeURIComponent(catalogId)}/streams?${query}`,
        getAccessToken,
        signal,
      ),
    );
    if (
      result.catalog_id !== catalogId ||
      result.pagination.page !== page ||
      result.periods.current.start !== period.since ||
      result.periods.days !== period.days
    )
      throw new Error("Stream response did not match this catalog and period.");
    return result;
  };
  const first = await read(1);
  if (first.pagination.total_count > 250)
    throw new Error(
      "Charts currently support catalogs with up to 250 recordings.",
    );
  const pages = Math.max(1, Math.ceil(first.pagination.total_count / 25));
  const results = [first];
  for (let page = 2; page <= pages; page += 3) {
    results.push(
      ...(await Promise.all(
        Array.from({ length: Math.min(3, pages - page + 1) }, (_, i) =>
          read(page + i),
        ),
      )),
    );
  }
  if (
    results.some(
      (page, index) =>
        page.pagination.total_count !== first.pagination.total_count ||
        page.pagination.has_more !== index + 1 < pages ||
        JSON.stringify(page.periods) !== JSON.stringify(first.periods),
    )
  )
    throw new Error("Catalog changed while loading. Please retry.");
  const recordings = results.flatMap((page) => page.recordings);
  if (
    recordings.length !== first.pagination.total_count ||
    new Set(recordings.map((r) => r.isrc)).size !== recordings.length
  )
    throw new Error("Catalog coverage changed while loading. Please retry.");
  return { ...first, recordings };
}
