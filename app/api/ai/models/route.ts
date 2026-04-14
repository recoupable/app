import { getAvailableModels } from "@/lib/ai/getAvailableModels";

/**
 * GET /api/ai/models
 *
 * Server-side endpoint that proxies `getAvailableModels()` so that the
 * client can fetch model metadata without requiring server-side imports
 * of `@ai-sdk/gateway`.
 */
export async function GET() {
  const start = Date.now();
  console.log("[/api/ai/models] request received");
  try {
    const models = await getAvailableModels();
    const durationMs = Date.now() - start;
    console.log("[/api/ai/models] resolved", {
      count: models.length,
      durationMs,
      sampleIds: models.slice(0, 5).map((m) => m.id),
      hasOidc: Boolean(process.env.VERCEL_OIDC_TOKEN),
    });
    if (models.length === 0) {
      console.warn("[/api/ai/models] returned empty model list");
    }
    return Response.json({ models });
  } catch (error) {
    console.error("[/api/ai/models] error", {
      durationMs: Date.now() - start,
      error,
    });
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 500 });
  }
}

// Disable caching to always serve the latest model list.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
