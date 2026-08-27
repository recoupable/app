import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import useCatalogs from "@/hooks/useCatalogs";
import { getBrowserTimezone } from "@/lib/home/getBrowserTimezone";
import type { BuildFirstTaskParamsInput } from "@/lib/onboarding/buildFirstTaskParams";

/**
 * The inputs both weekly-report entry points share (chat#2006): selected
 * artist, the account's email as recipient, the first claimed catalog, and
 * the browser timezone. `resolve` throws coded errors
 * (`ARTIST_REQUIRED` / `EMAIL_REQUIRED`) that `getWeeklyReportErrorMessage`
 * turns into copy. `isPreparing` is true until the catalog read settles, so
 * a task scheduled before it lands would not silently drop the catalog.
 */
export function useWeeklyReportTaskInput() {
  const { user } = usePrivy();
  const { selectedArtist } = useArtistProvider();
  const catalogsQuery = useCatalogs();
  const catalogName = catalogsQuery.data?.catalogs?.[0]?.name;

  const resolve = (): BuildFirstTaskParamsInput => {
    const artistAccountId = selectedArtist?.account_id;
    const artistName = selectedArtist?.name;
    if (!artistAccountId || !artistName) throw new Error("ARTIST_REQUIRED");
    const recipientEmail = user?.email?.address;
    if (!recipientEmail) throw new Error("EMAIL_REQUIRED");
    return {
      artistName,
      artistAccountId,
      recipientEmail,
      catalogName,
      timezone: getBrowserTimezone(),
    };
  };

  return { resolve, catalogName, isPreparing: catalogsQuery.isLoading };
}
