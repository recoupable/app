// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SocialRow from "@/components/Onboarding/SocialRow";
import type { SOCIAL } from "@/types/Agent";

const SOCIAL_ROW = {
  id: "social-123",
  link: "https://open.spotify.com/artist/abc",
  username: "drake",
} as unknown as SOCIAL;

const onFix = vi.fn();
const onRemove = vi.fn();

describe("SocialRow", () => {
  beforeEach(() => {
    onFix.mockClear();
    onRemove.mockClear();
    onRemove.mockResolvedValue(true);
  });

  it("offers a remove affordance for a social the user does not want", () => {
    render(
      <SocialRow
        social={SOCIAL_ROW}
        isSubmitting={false}
        onFix={onFix}
        onRemove={onRemove}
      />,
    );

    // useSocialFix could only add or replace, so a wrongly added profile could
    // not be taken back and the step dead-ended (chat#1889).
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    expect(onRemove).toHaveBeenCalledWith("social-123");
  });

  it("keeps the edit affordance alongside remove", () => {
    render(
      <SocialRow
        social={SOCIAL_ROW}
        isSubmitting={false}
        onFix={onFix}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByRole("button", { name: /edit/i })).toBeDefined();
  });
});
