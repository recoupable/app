interface CatalogSongsInfiniteScrollTriggerProps {
  observerTarget: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
}

const CatalogSongsInfiniteScrollTrigger = ({
  observerTarget,
  isFetchingNextPage,
}: CatalogSongsInfiniteScrollTriggerProps) => {
  return (
    <div ref={observerTarget} className="h-20 flex items-center justify-center">
      {isFetchingNextPage && (
        <p className="text-sm text-muted-foreground">Loading more songs...</p>
      )}
    </div>
  );
};

export default CatalogSongsInfiniteScrollTrigger;
