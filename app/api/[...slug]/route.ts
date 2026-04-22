import { NextRequest } from "next/server";
import { elysiaApi } from "@/lib/api/elysia/app";

async function handle(request: NextRequest): Promise<Response> {
  return elysiaApi.handle(request);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
