import { treaty } from "@elysiajs/eden";
import type { ElysiaApi } from "@/lib/api/elysia/app";

const client = treaty<ElysiaApi>("", {
  fetch: {
    credentials: "include",
  },
});

export const api = client.api;
