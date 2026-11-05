import { Suspense } from "react";
import CatalogReviewsPage from "@/components/Catalog/Reviews/CatalogReviewsPage";

export default function CatalogReviews() {
  return (
    <Suspense
      fallback={
        <p className="p-6" role="status">
          Loading reviews…
        </p>
      }
    >
      <CatalogReviewsPage />
    </Suspense>
  );
}
