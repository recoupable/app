import CatalogReportPage from "@/components/Catalog/report/CatalogReportPage";

interface CatalogPageProps {
  params: Promise<{
    catalogId: string;
  }>;
}

const CatalogPage = async ({ params }: CatalogPageProps) => {
  const { catalogId } = await params;
  return <CatalogReportPage catalogId={catalogId} />;
};

export default CatalogPage;
