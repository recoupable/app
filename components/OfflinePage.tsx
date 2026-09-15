import Link from "next/link";
import ErrorPageLayout from "@/components/ErrorPageLayout";

const OfflinePage = () => (
  <ErrorPageLayout
    className="fixed inset-0 z-50 overflow-y-auto"
    eyebrow="CONNECTION / UNAVAILABLE"
    title="We can’t connect right now."
    description="Check your internet connection, then reload the page to try again."
    actions={
      <Link
        href="/"
        className="inline-flex h-12 items-center justify-center rounded-full bg-brand-lime px-6 text-sm font-medium text-brand-on-lime hover:bg-brand-lime-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Back to workspace
      </Link>
    }
  />
);

export default OfflinePage;
