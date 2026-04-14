import { getAvailableModels } from "@/lib/ai/getAvailableModels";

/**
 * GET /api/ai/models
 *
 * Server-side endpoint that proxies `getAvailableModels()` so that the
 * client can fetch model metadata without requiring server-side imports
 * of `@ai-sdk/gateway`.
 */
export async function GET() {
  try {
    const models = await getAvailableModels();
    return Response.json({ models });
  } catch (error) {
    console.error("/api/ai/models error", error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 500 });
  }
}

// Disable caching to always serve the latest model list.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
