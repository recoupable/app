import useCatalogs from "./useCatalogs";

/**
 * Whether a catalog belongs to the signed-in account. The report tab needs
 * this to tell "your measurement has not landed yet" apart from "this catalog
 * was measured by someone else" — the api returns 404 for both (chat#1912 row 1).
 *
 * Resolution is derived from `isSuccess`/`isError`, never from `!isLoading`:
 * `useCatalogs` is `enabled: !!accountId && authenticated`, and a disabled
 * TanStack Query v5 query reports isPending true / isFetching false, so
 * `isLoading` is already false while Privy and the account are still resolving.
 * Treating that as a resolved empty list called a signed-in owner a stranger
 * and announced "measured by another account" on their own catalog. Same trap
 * documented in SetupValuation.
 */
const useOwnsCatalog = (catalogId?: string) => {
  const { data, isSuccess, isError } = useCatalogs();

  return {
    ownsCatalog:
      !!catalogId && !!data?.catalogs?.some((c) => c.id === catalogId),
    isResolved: isSuccess || isError,
    /** The list failed, so ownership carries no information either way. */
    ownershipUnknown: isError,
  };
};

export default useOwnsCatalog;
