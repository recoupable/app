import { describe, expect, it } from "vitest";
import { findStarterTemplate } from "@/lib/home/findStarterTemplate";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

const template = (over: Partial<AgentTemplateRow>): AgentTemplateRow =>
  ({
    id: "t-1",
    title: "Some Agent",
    description: "",
    prompt: "do things",
    tags: null,
    creator: null,
    is_private: false,
    created_at: null,
    favorites_count: null,
    updated_at: null,
    ...over,
  }) as AgentTemplateRow;

describe("findStarterTemplate", () => {
  it("prefers the Weekly Performance Dashboard template", () => {
    const templates = [
      template({ id: "a", title: "Run Performance Report", tags: ["Report"] }),
      template({
        id: "b",
        title: "Weekly Performance Dashboard",
        tags: ["Report"],
      }),
    ];
    expect(findStarterTemplate(templates)?.id).toBe("b");
  });

  it("falls back to the first Report-tagged template", () => {
    const templates = [
      template({ id: "a", title: "5 Viral Content Ideas", tags: ["Create"] }),
      template({ id: "b", title: "YouTube Revenue Report", tags: ["Report"] }),
    ];
    expect(findStarterTemplate(templates)?.id).toBe("b");
  });

  it("returns undefined when no Report template exists", () => {
    expect(
      findStarterTemplate([template({ tags: ["Create"] })]),
    ).toBeUndefined();
    expect(findStarterTemplate([])).toBeUndefined();
    expect(findStarterTemplate(undefined)).toBeUndefined();
  });
});
