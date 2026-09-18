import { expect, it } from "vitest";
import { generateSite } from "../generateSite";
import { designSchema, type Site } from "../schema";
// Explicit opt-in: normal test runs must never spend model credits.
it.skipIf(process.env.SITES_LIVE_TEST !== "1")(
  "generates a real page design using the configured provider",
  async () => {
    const site = {
      name: "Night Garden",
      brief:
        "A fictional instrumental release. Warm cream, forest green, editorial typography. Do not invent release dates.",
      release_url: "",
      assets: [],
      draft: null,
    } as unknown as Site;
    const result = await generateSite(site, site.brief);
    expect(designSchema.safeParse(result.design).success).toBe(true);
    expect(result.design.headline.length).toBeGreaterThan(0);
    expect(result.name).toBe("Night Garden");
  },
  110000,
);
