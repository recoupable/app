import { z } from "zod";
import { isPlaygroundEnabled } from "@/lib/intelligent-ui/playground/isPlaygroundEnabled";
import { playgroundScenarios } from "@/lib/intelligent-ui/playground/scenarios";
import { createExampleStream } from "@/lib/intelligent-ui/playground/createExampleStream";

export const dynamic = "force-dynamic";

export function GET(request: Request): Response {
  if (!isPlaygroundEnabled()) return new Response(null, { status: 404 });
  const result = z
    .string()
    .max(128)
    .safeParse(new URL(request.url).searchParams.get("scenario"));
  const scenario = result.success
    ? playgroundScenarios.find((item) => item.id === result.data)
    : undefined;
  if (!scenario)
    return Response.json(
      { error: "Choose a supported example." },
      { status: 400 },
    );
  return new Response(createExampleStream(scenario.events, request.signal), {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Content-Type-Options": "nosniff",
      "X-Accel-Buffering": "no",
    },
  });
}
