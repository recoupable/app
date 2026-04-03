import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { authPlugin } from "@/lib/api/elysia/plugins/auth";
import { elysiaRoutes } from "@/lib/api/elysia/routes";

export const elysiaApi = new Elysia({ prefix: "/api" })
  .use(
    openapi({
      path: "/openapi",
      specPath: "/openapi/json",
      provider: "scalar",
      documentation: {
        info: {
          title: "Recoupable Chat API (Elysia POC)",
          version: "0.1.0",
        },
        components: {
          securitySchemes: {
            apiKeyAuth: {
              type: "apiKey",
              in: "header",
              name: "x-api-key",
            },
          },
        },
      },
    }),
  )
  .use(authPlugin)
  .use(elysiaRoutes);

export type ElysiaApi = typeof elysiaApi;
