import { proxySitesRequest } from "@/lib/sites/proxySitesRequest";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxySitesRequest(
    request,
    `/${encodeURIComponent((await params).id)}/preview`,
  );
}
