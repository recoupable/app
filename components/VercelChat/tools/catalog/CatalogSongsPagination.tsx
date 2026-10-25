import { Button } from "@/components/ui/button";

export default function CatalogSongsPagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label="Returned songs pages"
      className="flex flex-wrap items-center gap-2 px-3 py-2"
    >
      <span className="w-full text-xs text-muted-foreground" aria-live="polite">
        Page {page + 1} of {pageCount} · Already loaded songs
      </span>
      {[
        { label: "First", target: 0, disabled: page === 0 },
        { label: "Previous", target: page - 1, disabled: page === 0 },
        { label: "Next", target: page + 1, disabled: page === pageCount - 1 },
        {
          label: "Last",
          target: pageCount - 1,
          disabled: page === pageCount - 1,
        },
      ].map(({ label, target, disabled }) => (
        <Button
          key={label}
          type="button"
          variant="outline"
          size="sm"
          aria-label={`${label} page of returned songs`}
          disabled={disabled}
          onClick={() => onPageChange(target)}
        >
          {label}
        </Button>
      ))}
    </nav>
  );
}
