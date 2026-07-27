import { redirect } from "next/navigation";

/**
 * `/setup/valuation` — welcome email step 4 ("See your baseline valuation").
 * The baseline valuation is the catalog report (`/catalogs/[catalogId]`), which
 * is not addressable without a catalog id here, so route to the catalog list.
 * Revisit if a dedicated valuation landing is built.
 */
export default function SetupValuationPage() {
  redirect("/catalogs");
}
