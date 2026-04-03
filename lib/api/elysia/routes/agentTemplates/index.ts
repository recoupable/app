import { Elysia } from "elysia";
import { agentTemplateFavoritesRoute } from "@/lib/api/elysia/routes/agentTemplates/favorites";

export const agentTemplateRoutes = new Elysia({ prefix: "/agent-templates" })
  .use(agentTemplateFavoritesRoute);
