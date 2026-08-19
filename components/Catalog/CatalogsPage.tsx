"use client";

import CatalogsPageContent from "./CatalogsPageContent";
import ValuationRunStatusChip from "@/components/Valuation/ValuationRunStatusChip";

const CatalogsPage = () => {
  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center gap-3 pb-4">
        <h1 className="text-lg md:text-xl font-medium">Catalogs</h1>
        <ValuationRunStatusChip />
      </div>
      <CatalogsPageContent />
    </div>
  );
};

export default CatalogsPage;
