import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import OAuthConsent from "../../components/OAuth/OAuthConsent";
import "../../app/globals.css";

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    ready: true,
    authenticated: true,
    user: {
      id: "synthetic-account",
      email: { address: "artist@example.test" },
    },
    login: vi.fn(),
    logout: vi.fn(),
    getAccessToken: async () => "synthetic-session",
  }),
}));
vi.mock("@/lib/oauth/createConsentClient", () => ({
  createConsentClient: () => {
    const base = {
      csrf: "synthetic-nonce",
      clientId: "synthetic-client",
      clientName: "Studio assistant",
      accessDurationDays: null,
      permissions: [{ scope: "mcp:tools", description: "Full business tools" }],
    };
    return {
      load: async () => base,
      loadSelected: async (
        _token: string,
        selection?: { workspace_kind: string },
      ) => ({
        ...base,
        consent_version: 2,
        csrf: selection ? "selected-nonce" : undefined,
        selectedContext: selection
          ? { kind: selection.workspace_kind }
          : undefined,
        permissions: [
          {
            scope: "mcp:tools",
            description:
              "Read and save Context briefs, ingest research, review releases, and plan or run Context jobs in one workspace.",
          },
        ],
        workspaces: [
          {
            kind: "personal",
            organizationId: null,
            name: "Personal workspace",
          },
          {
            kind: "organization",
            organizationId: "22222222-2222-4222-8222-222222222222",
            name: "North Star Records",
          },
        ],
      }),
      decide: vi.fn(),
    };
  },
}));
afterEach(cleanup);
it.each([
  [390, 844, "mobile"],
  [1280, 1000, "desktop"],
] as const)(
  "shows the explicit selected workspace at %s by %s",
  async (width, height, name) => {
    await page.viewport(width, height);
    const font = new FontFace(
      "Recoup test DM Sans",
      "url(/app/fonts/DMSans-Latin.woff2)",
    );
    document.fonts.add(await font.load());
    document.documentElement.style.setProperty(
      "--font-dm-sans",
      '"Recoup test DM Sans"',
    );
    render(
      <OAuthConsent
        issuer="https://api.example/api/oauth"
        interaction="selected-fixture"
      />,
    );
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Choose one workspace for Context tools",
      }),
    );
    const select = await screen.findByLabelText("Workspace for Context tools");
    expect(
      (
        screen.getByRole("button", {
          name: "Allow access",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.change(select, {
      target: { value: "22222222-2222-4222-8222-222222222222" },
    });
    await screen.findByLabelText("Workspace for Context tools");
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    expect(screen.queryByText("Full business tools")).toBeNull();
    await page.screenshot({
      path: `__screenshots__/selected-context-${name}.png`,
      fullPage: true,
    });
  },
);
