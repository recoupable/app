import { beforeEach, expect, it, vi } from "vitest";
const ai = vi.hoisted(() => ({ generateObject: vi.fn() }));
vi.mock("ai", () => ai);
import { generateSite } from "../generateSite";
import type { Site } from "../schema";
const site = {
  name: "Maze",
  brief: "A game",
  release_url: "",
  assets: [
    {
      name: "Cover",
      type: "image",
      url: "https://assets.example.test/cover.webp",
    },
  ],
  draft: null,
} as unknown as Site;
beforeEach(() => vi.resetAllMocks());
it("rejects invalid JavaScript rather than saving a broken draft", async () => {
  ai.generateObject.mockResolvedValue({
    object: { experience: { javascript: "function {" } },
  });
  await expect(generateSite(site, "Build it")).rejects.toThrow();
});
it("passes actual assets and generates behavior, not just art direction", async () => {
  ai.generateObject.mockResolvedValue({
    object: {
      experience: {
        javascript: "const score=0;",
        html: "<canvas></canvas>",
        css: "",
      },
    },
  });
  const result = await generateSite(site, "Build it");
  expect(result.design.experience?.html).toBe("<canvas></canvas>");
  expect(ai.generateObject.mock.calls[0][0].prompt).toContain(
    site.assets[0].url,
  );
  expect(ai.generateObject.mock.calls[0][0].system).toContain(
    "playable mechanics",
  );
});
