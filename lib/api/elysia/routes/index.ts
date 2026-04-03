import { Elysia } from "elysia";
import { agentTemplateRoutes } from "@/lib/api/elysia/routes/agentTemplates";
import { youtubeRoutes } from "@/lib/api/elysia/routes/youtube";

export const elysiaRoutes = new Elysia().use(youtubeRoutes).use(agentTemplateRoutes);
