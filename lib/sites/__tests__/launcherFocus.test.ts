import { expect, it } from "vitest";
import postcss from "postcss";
import { renderExperience } from "../renderExperience";
import type { SiteSnapshot } from "../schema";

function luminance(color: string) {
  const hex = color === "white" ? "ffffff" : color.replace("#", "");
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

it.each(["#FFFFFF", "#132B26"])(
  "keeps a focus-only indicator on the launcher surface with host %s",
  (background) => {
    const site: SiteSnapshot = {
      name: "Focus fixture",
      releaseUrl: "",
      assets: [],
      design: {
        headline: "Focus fixture",
        eyebrow: "",
        description: "",
        buttonLabel: "",
        signupHeading: "",
        layout: "poster",
        background,
        foreground: "#152E37",
        accent: "#D6FF62",
        font: "sans",
        experience: { html: "<h1>Focus fixture</h1>", css: "", javascript: "" },
      },
    };
    const html = renderExperience(site);
    const css = postcss.parse(html.match(/<style>([\s\S]*?)<\/style>/)![1]);
    const rules: Record<string, Record<string, string>> = {};
    css.walkRules((rule) => {
      if (!rule.selector.startsWith(".music-toggle")) return;
      const declarations = (rules[rule.selector] ??= {});
      rule.walkDecls((declaration) => {
        declarations[declaration.prop] = declaration.value;
      });
    });
    const normal = rules[".music-toggle"];
    const focus = rules[".music-toggle:focus-visible"];
    // The inset stays visible at the viewport edge and does not rely on host color.
    const inset = focus["box-shadow"]?.match(
      /inset 0 0 0 (\d+)px (white|#[\da-f]{6})/i,
    );
    expect(inset).toBeTruthy();
    expect(Number(inset![1])).toBeGreaterThanOrEqual(2);
    expect(normal["box-shadow"]).not.toContain("inset");
    for (const surface of [
      normal.background,
      rules[".music-toggle:hover"].background,
    ])
      expect(contrast(inset![2], surface)).toBeGreaterThanOrEqual(3);
    // Retain a real outline using the shared focus token, visible on the white host.
    expect(focus.outline).toBe("2px solid #087BAB");
    expect(contrast("#087BAB", "#FFFFFF")).toBeGreaterThanOrEqual(3);
  },
);
