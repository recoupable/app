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
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&amp;lt;img");
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
it("renders the full trusted player in a private draft while isolating generated code", () => {
  const html = renderSite(
    snapshot,
    undefined,
    "https://example.test/s/spotify/connect",
    {
      preview: true,
      siteId: "site",
      previewToken: "grant.signature",
      playbackAudioUrl: "https://audio.test/track.wav",
    },
  );
  expect(html).toContain('data-preview="true"');
  expect(html).toContain('data-player-enabled="true"');
  expect(html).toContain('id="music-frame"');
  expect(html).toContain('sandbox="allow-scripts allow-downloads"');
  expect(html).not.toContain('data-activity-url="/s/');
});
