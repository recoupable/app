import { describe, expect, it } from "vitest";
import { renderSite } from "../renderSite";
import { designSchema, type SiteSnapshot } from "../schema";
const site: SiteSnapshot = {
  name: "Test game",
  assets: [],
  releaseUrl: "https://open.spotify.com/track/abc",
  design: {
    headline: "Play",
    eyebrow: "",
    description: "",
    buttonLabel: "Listen",
    signupHeading: "Updates",
    background: "#000000",
    foreground: "#ffffff",
    accent: "#ffff00",
    layout: "poster",
    font: "sans",
    experience: {
      html: '<button id="start">Start</button>',
      css: "body{color:white}",
      javascript:
        'document.querySelector("#start").onclick=()=>{document.body.dataset.started="true"}',
    },
  },
};
describe("interactive experience isolation", () => {
  it("runs game code only inside an opaque sandbox", () => {
    const html = renderSite(site, "/s/111/signup");
    expect(html).toContain('sandbox="allow-scripts"');
    expect(html).not.toContain("allow-same-origin");
    expect(html).toContain("connect-src &#39;none&#39;");
    expect(html).toContain("form-action &#39;none&#39;");
    expect(html).toContain("&lt;button id=&quot;start&quot;");
    expect(html).not.toContain('<button id="start">');
    expect(html).toContain('id="spotify-connect"');
  });
  it("keeps hostile game markup inside the frame attribute", () => {
    const hostile = structuredClone(site);
    hostile.design.experience!.html =
      '"></iframe><script>top.location="https://evil.test"</script>';
    expect(renderSite(hostile)).not.toContain("</iframe><script>top");
  });
  it("escapes metadata and limits generated payload size", () => {
    expect(
      designSchema.safeParse({
        ...site.design,
        experience: {
          ...site.design.experience,
          javascript: "x".repeat(80001),
        },
      }).success,
    ).toBe(false);
    expect(renderSite({ ...site, name: "<script>evil</script>" })).toContain(
      "&lt;script&gt;evil&lt;/script&gt;",
    );
  });
  it("preserves existing saved landing pages", () => {
    const legacy = structuredClone(site);
    delete legacy.design.experience;
    expect(renderSite(legacy)).toContain('<main class="poster">');
  });
});
