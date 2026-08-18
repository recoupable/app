import Link from "next/link";

/**
 * Minimal header for public pages: wordmark plus the two funnel actions from
 * the approved design. No sidebar, no auth-dependent chrome.
 */
const PublicHeader = () => (
  <header className="flex items-center justify-between px-5 py-4 shadow-[0px_1px_0px_0px_var(--border)] md:px-12 md:py-5">
    <Link href="/" className="font-mono text-base font-bold tracking-wider md:text-lg">
      RECOUPABLE
    </Link>
    <div className="flex items-center gap-3">
      <Link
        href="/signin"
        className="hidden rounded-xl px-4 py-2 text-sm font-medium shadow-[0px_0px_0px_1px_var(--border)] transition-colors hover:bg-muted md:block"
      >
        Sign in
      </Link>
      <Link
        href="/"
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Get started
      </Link>
    </div>
  </header>
);

export default PublicHeader;
