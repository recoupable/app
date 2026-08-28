"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import trackEvent from "@/lib/analytics/trackEvent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CatalogSongsPageContent from "@/components/Catalog/CatalogSongsPageContent";
import CatalogReportContent from "./CatalogReportContent";

interface CatalogReportPageProps {
  catalogId: string;
}

/**
 * /catalogs/[catalogId] — the post-valuation catalog report (chat#1867 step 1).
 * The report is the landing view; the existing songs/ISRC management screen
 * stays reachable as a secondary tab.
 */
const CatalogReportPage = ({ catalogId }: CatalogReportPageProps) => {
  const router = useRouter();

  useEffect(() => {
    trackEvent("valuation_report_viewed", { catalog_id: catalogId });
  }, [catalogId]);

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center gap-2 pb-4">
        <button
          type="button"
          onClick={() => router.push("/catalogs")}
          className="flex items-center gap-1 rounded px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalogs
        </button>
      </div>
      <h1 className="font-heading text-lg font-bold md:text-xl pb-4">
        Catalog Report
      </h1>
      <Tabs defaultValue="report">
        <TabsList>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="songs">Manage songs</TabsTrigger>
        </TabsList>
        <TabsContent value="report" className="pt-2">
          <CatalogReportContent catalogId={catalogId} />
        </TabsContent>
        <TabsContent value="songs" className="pt-2">
          <CatalogSongsPageContent catalogId={catalogId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CatalogReportPage;
