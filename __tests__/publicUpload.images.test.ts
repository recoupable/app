import { expect, it } from "vitest";
import { matchRemotePattern } from "next/dist/shared/lib/match-remote-pattern";
import config from "../next.config.mjs";
it("permits Supabase public uploads and legacy images but not private storage URLs", () => {
  const allowed = (value: string) =>
    config.images.remotePatterns.some(
      (pattern: Parameters<typeof matchRemotePattern>[0]) =>
        matchRemotePattern(pattern, new URL(value)),
    );
  expect(
    allowed(
      "https://project.supabase.co/storage/v1/object/public/public-uploads/account/image.png",
    ),
  ).toBe(true);
  expect(allowed("https://arweave.net/existing-image")).toBe(true);
  expect(
    allowed(
      "https://project.supabase.co/storage/v1/object/public/private-files/image.png",
    ),
  ).toBe(false);
  expect(
    allowed(
      "https://project.supabase.co/storage/v1/object/sign/public-uploads/image.png?token=secret",
    ),
  ).toBe(false);
  expect(
    allowed(
      "http://project.supabase.co/storage/v1/object/public/public-uploads/image.png",
    ),
  ).toBe(false);
});
