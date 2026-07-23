import { redirect } from "next/navigation";

/**
 * `/setup/catalog` — welcome email step 3 ("Claim your catalog"). There is no
 * dedicated claim-catalog onboarding step component yet; the catalog surface is
 * `/catalogs`, so route there. Revisit if a first-class claim step is built.
 */
export default function SetupCatalogPage() {
  redirect("/catalogs");
}
