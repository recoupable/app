import { proxySitesRequest } from "@/lib/sites/proxySitesRequest";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxySitesRequest(
    request,
    `/public/${encodeURIComponent(id)}/activity`,
  );
}
