import CatalogReportPage from "@/components/Catalog/report/CatalogReportPage";

interface CatalogPageProps {
  searchParams: Promise<{ tab?: string }>;
  params: Promise<{
    catalogId: string;
  }>;
}

const CatalogPage = async ({ params, searchParams }: CatalogPageProps) => {
  const { catalogId } = await params;
  const { tab } = await searchParams;
  return (
    <CatalogReportPage
      catalogId={catalogId}
      initialTab={tab === "songs" ? "songs" : "report"}
    />
  );
};

export default CatalogPage;
