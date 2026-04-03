import { Elysia } from "elysia";
import { youtubeChannelInfoRoute } from "@/lib/api/elysia/routes/youtube/channelInfo";

export const youtubeRoutes = new Elysia({ prefix: "/youtube" }).use(
  youtubeChannelInfoRoute,
);
