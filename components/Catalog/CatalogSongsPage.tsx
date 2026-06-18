"use client";

import CatalogSongsPageContent from "./CatalogSongsPageContent";
import CatalogLandingHeader from "./CatalogLandingHeader";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface CatalogSongsPageProps {
  catalogId: string;
}

const CatalogSongsPage = ({ catalogId }: CatalogSongsPageProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/catalogs");
  };

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center gap-2 pb-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalogs
        </button>
      </div>
      <CatalogLandingHeader catalogId={catalogId} />
      <CatalogSongsPageContent catalogId={catalogId} />
    </div>
  );
};

export default CatalogSongsPage;
