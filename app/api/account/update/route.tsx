import { NextRequest } from "next/server";
import { NEW_API_BASE_URL } from "@/lib/consts";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return Response.json({ status: "error", error: "Authorization header required" }, { status: 401 });
  }

  try {
    const response = await fetch(`${NEW_API_BASE_URL}/api/accounts`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
