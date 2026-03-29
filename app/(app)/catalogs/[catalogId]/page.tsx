import CatalogSongsPage from "@/components/Catalog/CatalogSongsPage";

interface CatalogPageProps {
  params: Promise<{
    catalogId: string;
  }>;
}

const CatalogPage = async ({ params }: CatalogPageProps) => {
  const { catalogId } = await params;
  return <CatalogSongsPage catalogId={catalogId} />;
};

export default CatalogPage;
