"use client";

import CatalogsPageContent from "./CatalogsPageContent";

const CatalogsPage = () => {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-lg md:text-xl font-medium pb-4">Catalogs</h1>
      <CatalogsPageContent />
    </div>
  );
};

export default CatalogsPage;
