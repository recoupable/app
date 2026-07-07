import { describe, expect, it } from "vitest";
import { buildStarterTaskParams } from "@/lib/home/buildStarterTaskParams";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

const template = {
  id: "9046c7e9-fd5a-4f08-a472-381d51bd6c90",
  title: "Weekly Performance Dashboard",
  description: "Weekly stats email",
  prompt:
    "Set up a weekly performance dashboard that emails me every Monday with my stats from all platforms.",
  tags: ["Report"],
  creator: null,
  is_private: false,
  created_at: null,
  favorites_count: null,
  updated_at: null,
} as AgentTemplateRow;

describe("buildStarterTaskParams", () => {
  const params = buildStarterTaskParams({
    template,
    artistName: "Del Water Gap",
    artistAccountId: "artist-1",
  });

  it("titles the task after the template and the artist", () => {
    expect(params.title).toBe("Weekly Performance Dashboard — Del Water Gap");
  });

  it("uses the agent template's prompt verbatim (DRY — no hand-written prompt)", () => {
    expect(params.prompt).toBe(template.prompt);
  });

  it("schedules Mondays", () => {
    expect(params.schedule).toBe("0 9 * * 1");
  });

  it("targets the artist account", () => {
    expect(params.artist_account_id).toBe("artist-1");
  });
});
