"use client";

import Link from "next/link";
import { useCatalogTaskSetup } from "@/hooks/useCatalogTaskSetup";

interface CatalogTaskSetupProps {
  catalogId: string | string[];
}

/** Safe landing until the weekly executor supports the exact viewed catalog. */
const CatalogTaskSetup = ({ catalogId }: CatalogTaskSetupProps) => {
  const { state, catalogName, retry } = useCatalogTaskSetup(catalogId);
  const copy = {
    invalid:
      "This catalog link is invalid. Open the catalog again to continue.",
    "sign-in": "Sign in to check access to this catalog.",
    loading: "Checking catalog access…",
    error: "We couldn't check catalog access. Try again.",
    missing: "This catalog is no longer available to this account.",
    workspace:
      "This catalog isn't available in the selected workspace. Switch to its workspace and try again.",
    unsupported: `Weekly reports for “${catalogName}” aren't available yet. The current weekly report follows one artist's discography and can't preserve this catalog's exact scope.`,
  }[state];
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <section className="rounded-2xl bg-card p-6 sm:p-8 shadow-[0_0_0_1px_var(--border),0_2px_4px_rgba(0,0,0,0.04)]">
        <h1 className="text-xl font-semibold text-foreground">
          Weekly catalog report
        </h1>
        <p
          className="mt-2 text-sm text-muted-foreground"
          role={state === "error" ? "alert" : "status"}
        >
          {copy}
        </p>
        {state === "unsupported" && (
          <p className="mt-2 text-sm text-muted-foreground">
            No report has been run and no task has been created.
          </p>
        )}
        {state === "error" && (
          <button
            type="button"
            onClick={() => void retry()}
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Try again
          </button>
        )}
        <Link
          href="/catalogs"
          className="mt-4 block text-sm text-brand-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to catalogs
        </Link>
      </section>
    </div>
  );
};

export default CatalogTaskSetup;
