import { proxySitesRequest } from "@/lib/sites/proxySitesRequest";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxySitesRequest(request, `/${encodeURIComponent(id)}/fans`);
}
