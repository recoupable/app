import { expect, it } from "vitest";
import { GET } from "@/app/s/apple/connect/route";
it("renders Gatsby's Apple album in the trusted player", async () => {
  const response = await GET(
    new Request(
      "https://app.recoupable.dev/s/apple/connect?release=https://music.apple.com/us/album/beautiful-tomorrow/1894545725&parent=https://www.gatsby.wtf",
    ),
  );
  expect(response.status).toBe(200);
  const html = await response.text();
  expect(html).toContain('data-release-kind="album"');
  expect(html).toContain('data-release-id="1894545725"');
  expect(html).not.toContain("developerToken");
});
it("rejects injected URLs and untrusted parent origins", async () => {
  for (const suffix of [
    "release=https://evil.test/song/x/123",
    "release=https://music.apple.com/us/song/x/123&parent=https://evil.test",
  ])
    expect(
      (
        await GET(
          new Request("https://app.recoupable.dev/s/apple/connect?" + suffix),
        )
      ).status,
    ).toBe(400);
});
