import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useUserProvider } from "@/providers/UserProvder";
import {
  getCatalogReportEmptyCopy,
  type CatalogReportEmptyState as EmptyState,
} from "@/lib/catalog/getCatalogReportEmptyCopy";

const CTA_CLASS =
  "mt-4 inline-flex h-9 items-center rounded-xl bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

/**
 * Report-tab state for everything that is not a rendered report. Each state
 * keeps the customer in the app: the cross-account and signed-out cases used to
 * point at recoupable.dev, which is how a signed-in customer ended up re-running
 * a valuation that was already running (chat#1912 row 1).
 */
const CatalogReportEmptyState = ({
  state,
  hasOwnCatalogs,
  measuredSongCount,
}: {
  state: EmptyState;
  hasOwnCatalogs: boolean;
  measuredSongCount?: number;
}) => {
  const { login } = useUserProvider();
  const copy = getCatalogReportEmptyCopy(state, { hasOwnCatalogs }, { measuredSongCount });

  return (
    <div className="max-w-3xl rounded-2xl bg-card p-6 sm:p-8 shadow-[0_0_0_1px_var(--border)]">
      <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
        {state === "measuring" && (
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
        {copy.title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {copy.body}
      </p>
      {copy.cta?.href && (
        <Link href={copy.cta.href} className={CTA_CLASS}>
          {copy.cta.label}
        </Link>
      )}
      {copy.cta?.action === "login" && (
        <button type="button" onClick={login} className={CTA_CLASS}>
          {copy.cta.label}
        </button>
      )}
    </div>
  );
};

export default CatalogReportEmptyState;
