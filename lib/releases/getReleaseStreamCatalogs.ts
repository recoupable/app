import { z } from "zod";
import { requestStreamData } from "./requestStreamData";
const schema = z.object({
  catalogs: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      owner: z.object({ id: z.string() }).nullable().optional(),
    }),
  ),
});
/** Read only catalogs available through the selected workspace's account. */
export async function getReleaseStreamCatalogs(
  accountId: string,
  getAccessToken: () => Promise<string | null>,
  signal: AbortSignal,
) {
  return schema
    .parse(
      await requestStreamData(
        `accounts/${encodeURIComponent(accountId)}/catalogs`,
        getAccessToken,
        signal,
      ),
    )
    .catalogs.filter((catalog) => catalog.owner?.id === accountId);
}
