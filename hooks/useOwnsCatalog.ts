import useCatalogs from "./useCatalogs";

/**
 * Whether a catalog belongs to the signed-in account. The report tab needs
 * this to tell "your measurement has not landed yet" apart from "this catalog
 * was measured by someone else" — the api returns 404 for both (chat#1912 row 1).
 *
 * `isResolved` is false until the catalog list has actually loaded, so callers
 * do not treat a pending list as proof of non-ownership.
 */
const useOwnsCatalog = (catalogId?: string) => {
  const { data, isLoading } = useCatalogs();

  return {
    ownsCatalog: !!catalogId && !!data?.catalogs?.some((c) => c.id === catalogId),
    isResolved: !isLoading,
  };
};

export default useOwnsCatalog;
