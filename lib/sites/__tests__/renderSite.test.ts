import { describe, it, expect } from "vitest";
import { renderSite } from "../renderSite";
import type { SiteSnapshot } from "../schema";
const snapshot: SiteSnapshot = {
  name: "<script>alert(1)</script>",
  releaseUrl: "https://open.spotify.com/album/test",
  assets: [],
  design: {
    headline: "<img src=x onerror=alert(1)>",
    eyebrow: "New release",
    description: "Listen now",
    buttonLabel: "Listen",
    signupHeading: "Stay in touch",
    background: "#101010",
    foreground: "#ffffff",
    accent: "#baff00",
    layout: "editorial",
    font: "serif",
  },
};
describe("renderSite", () => {
  it("escapes user and generated text", () => {
    const html = renderSite(snapshot, "/s/test/signup");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;img");
  });
  it("does not render a separate email signup form", () => {
    const html = renderSite(snapshot, "/s/test/signup");
    expect(html).not.toContain("<form");
    expect(html).not.toContain('type="email"');
  });
  it("does not allow signup in previews", () => {
    expect(renderSite(snapshot)).not.toContain("<form");
  });
});
