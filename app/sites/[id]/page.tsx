import SiteEditor from "@/components/Sites/SiteEditor";
export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SiteEditor id={id} />;
}
