import { Elysia, t } from "elysia";
import { addAgentTemplateFavorite } from "@/lib/supabase/agent_templates/addAgentTemplateFavorite";
import { removeAgentTemplateFavorite } from "@/lib/supabase/agent_templates/removeAgentTemplateFavorite";

const errorResponseSchema = t.String();

export const agentTemplateFavoritesRoute = new Elysia().post(
  "/favorites",
  async ({body, status, user}) => {
    try {
      if (body.isFavourite) {
        await addAgentTemplateFavorite(body.templateId, user.userId);
      } else {
        await removeAgentTemplateFavorite(body.templateId, user.userId);
      }

      return { success: true as const };
    } catch (error) {
      console.error("Error toggling favourite:", error);
      return status(500, "Failed to toggle favourite");
    }
  },
  {
    auth: true,
    body: t.Object({
      templateId: t.String(),
      isFavourite: t.Boolean(),
    }),
    response: {
      200: t.Object({
        success: t.Literal(true),
      }),
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
    detail: {
      summary: "Toggle agent template favorite",
      description:
        "Adds or removes a template favorite for the authenticated user.",
      tags: ["agent-templates"],
      security: [{ apiKeyAuth: [] }],
    },
  },
);
