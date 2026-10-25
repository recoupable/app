import FirstTaskStep from "@/components/Onboarding/FirstTaskStep";
import CatalogTaskSetup from "@/components/Onboarding/CatalogTaskSetup";

/** Explicit catalog requests must never mount the artist-based auto-run flow. */
const SetupTasksPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ catalogId?: string | string[] }>;
}) => {
  const { catalogId } = await searchParams;
  return catalogId === undefined ? (
    <FirstTaskStep />
  ) : (
    <CatalogTaskSetup catalogId={catalogId} />
  );
};

export default SetupTasksPage;
