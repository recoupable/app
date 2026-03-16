import { NextResponse } from "next/server";
import { addAgentTemplateFavorite } from "@/lib/supabase/agent_templates/addAgentTemplateFavorite";
import { removeAgentTemplateFavorite } from "@/lib/supabase/agent_templates/removeAgentTemplateFavorite";
import type { ToggleFavoriteRequest, ToggleFavoriteResponse } from "@/types/AgentTemplates";

export const runtime = "edge";

/**
 *
 * @param request
 */
export async function POST(request: Request) {
  try {
    const { templateId, userId, isFavourite }: ToggleFavoriteRequest = await request.json();

    if (!templateId || !userId) {
      return NextResponse.json({ error: "Missing templateId or userId" }, { status: 400 });
    }

    if (isFavourite) {
      await addAgentTemplateFavorite(templateId, userId);
    } else {
      await removeAgentTemplateFavorite(templateId, userId);
    }

    return NextResponse.json({ success: true } as ToggleFavoriteResponse);
  } catch (error) {
    console.error("Error toggling favourite:", error);
    return NextResponse.json({ error: "Failed to toggle favourite" } as ToggleFavoriteResponse, {
      status: 500,
    });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
