// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UsageRow from "@/components/UsagePage/UsageRow";

const event = {
  id: "evt-1",
  created_at: "2026-08-27T13:47:00.000Z",
  source: "chat",
  agent_type: "main",
  provider: null,
  model_id: "moonshotai/kimi-k3" as string | null,
  input_tokens: 10,
  cached_input_tokens: 0,
  output_tokens: 5,
  tool_call_count: 0,
  credits_deducted: 1300000,
  usd: "$1.30",
  resource_url: null as string | null,
};

const row = (e: typeof event) =>
  render(
    <table>
      <tbody>
        <UsageRow event={e} />
      </tbody>
    </table>,
  );

describe("UsageRow", () => {
  it("links to what produced the charge when the api gives a resource_url", () => {
    row({ ...event, resource_url: "/chat?roomId=room-1" });
    const link = screen.getByRole("link", { name: "View" });
    expect(link.getAttribute("href")).toBe("/chat?roomId=room-1");
  });

  it("links a song generation to its song", () => {
    row({
      ...event,
      model_id: "minimax/music-3",
      resource_url: "/music/gen-1",
    });
    expect(
      screen.getByRole("link", { name: "View" }).getAttribute("href"),
    ).toBe("/music/gen-1");
  });

  it("shows nothing to open for a plain API charge", () => {
    row({ ...event, source: "api", model_id: null, resource_url: null });
    expect(screen.queryByRole("link", { name: "View" })).toBeNull();
  });
});
