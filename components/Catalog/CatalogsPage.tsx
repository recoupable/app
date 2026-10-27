"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import AddCatalogButton from "./AddCatalogButton";
import CatalogsPageContent from "./CatalogsPageContent";
import ValuationRunStatusChip from "@/components/Valuation/ValuationRunStatusChip";

const CatalogsPage = () => {
  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center gap-3 pb-4">
        <h1 className="text-lg md:text-xl font-medium">Catalogs</h1>
        <ValuationRunStatusChip />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/catalogs/reviews">Catalog reviews</Link>
          </Button>
          <AddCatalogButton />
        </div>
      </div>
      <CatalogsPageContent />
    </div>
  );
};

export default CatalogsPage;
