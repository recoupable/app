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
  expect(JSON.stringify(ai.generateObject.mock.calls[0][0].messages)).toContain(
    site.assets[0].url,
  );
  expect(ai.generateObject.mock.calls[0][0].system).toContain(
    "playable mechanics",
  );
});

it("sends release artwork as visual input to the generator", async () => {
  ai.generateObject.mockResolvedValue({
    object: {
      experience: { javascript: "", html: "<main>Game</main>", css: "" },
    },
  });
  await generateSite(
    {
      ...site,
      assets: [
        {
          type: "image",
          name: "Artwork",
          url: "https://image-cdn-fa.spotifycdn.com/image/abc",
        },
      ],
    },
    "Choose the concept",
  );
  expect(ai.generateObject.mock.calls[0][0].messages[0].content).toContainEqual(
    {
      type: "image",
      image: new URL("https://image-cdn-fa.spotifycdn.com/image/abc"),
    },
  );
});
