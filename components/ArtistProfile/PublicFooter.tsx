/**
 * Minimal footer for public pages.
 */
const PublicFooter = () => (
  <footer className="mt-auto flex items-center justify-between px-5 py-4 text-[13px] text-muted-foreground shadow-[0px_-1px_0px_0px_var(--border)] md:px-12 md:py-5">
    <span>Powered by Recoupable</span>
    <a href="https://recoupable.dev" className="hover:text-foreground">
      recoupable.dev
    </a>
  </footer>
);

export default PublicFooter;
