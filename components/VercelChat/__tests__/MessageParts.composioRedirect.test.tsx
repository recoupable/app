// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { MessageParts } from "@/components/VercelChat/MessageParts";

afterEach(cleanup);

const redirect =
  "https://connect.example.test/authorize?state=synthetic%2Bstate&return_to=%2Fnotes";

const renderConnection = (
  redirectUrl: unknown,
  status = "initiated",
  sibling?: Record<string, unknown>,
) => {
  const message = {
    id: "connection-redirect",
    role: "assistant",
    parts: [
      { type: "text", text: "Here is the connection request." },
      {
        type: "dynamic-tool",
        toolName: "COMPOSIO_MANAGE_CONNECTIONS",
        toolCallId: "connection-redirect-call",
        state: "output-available",
        input: {},
        output: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                data: {
                  results: {
                    googledrive: {
                      toolkit: "googledrive",
                      status,
                      redirect_url: redirectUrl,
                    },
                    ...(sibling ? { googlesheets: sibling } : {}),
                  },
                },
              }),
            },
          ],
        },
      },
      { type: "text", text: "The conversation can continue here." },
    ],
  } as unknown as UIMessage;
  return render(
    <MessageParts
      message={message}
      mode="view"
      setMode={() => {}}
      status="ready"
      reload={() => {}}
    />,
  );
};

describe("MessageParts — connector redirect actions", () => {
  it.each([
    "http://connect.example.test/authorize",
    "javascript:void(0)",
    "//connect.example.test/authorize",
    "not a connection URL",
    "",
    null,
    false,
    0,
  ])(
    "keeps an unusable redirect from becoming a connection action: %s",
    (url) => {
      renderConnection(url);
      expect(
        screen.queryByRole("link", { name: "Connect Google Drive" }),
      ).toBeNull();
      expect(
        screen.getByText(
          "This connection link is unavailable. Ask for a new link.",
        ),
      ).toBeTruthy();
      expect(screen.getByText("Google Drive Access Required")).toBeTruthy();
      expect(screen.getByText("Here is the connection request.")).toBeTruthy();
      expect(
        screen.getByText("The conversation can continue here."),
      ).toBeTruthy();
      expect(screen.queryByText(/Link expires/)).toBeNull();
    },
  );

  it("preserves an HTTPS destination and the conversation when authorizing", () => {
    renderConnection(redirect);
    const link = screen.getByRole("link", { name: "Connect Google Drive" });
    expect(link.getAttribute("href")).toBe(redirect);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")?.split(" ")).toEqual(
      expect.arrayContaining(["noopener", "noreferrer"]),
    );
    expect(
      screen.queryByText(/This connection link is unavailable/),
    ).toBeNull();
    expect(
      screen.getByText("The conversation can continue here."),
    ).toBeTruthy();
  });

  it("preserves the absent-result behavior", () => {
    renderConnection(undefined);
    expect(screen.queryByText(/Google Drive Access Required/)).toBeNull();
    expect(
      screen.queryByText(/This connection link is unavailable/),
    ).toBeNull();
    expect(
      screen.getByText("The conversation can continue here."),
    ).toBeTruthy();
  });

  it.each(["", null, false, 0])(
    "keeps an active sibling ahead of an unusable redirect: %s",
    (url) => {
      renderConnection(url, "initiated", {
        toolkit: "googlesheets",
        status: "active",
      });
      expect(screen.getByText("Google Sheets Connected")).toBeTruthy();
      expect(screen.queryByText(/Google Drive Access Required/)).toBeNull();
      expect(
        screen.queryByText(/This connection link is unavailable/),
      ).toBeNull();
      expect(
        screen.getByText("The conversation can continue here."),
      ).toBeTruthy();
    },
  );

  it.each(["", null, false, 0])(
    "keeps an actionable sibling ahead of an unusable redirect: %s",
    (url) => {
      renderConnection(url, "initiated", {
        toolkit: "googlesheets",
        redirect_url: redirect,
      });
      expect(
        screen
          .getByRole("link", { name: "Connect Google Sheets" })
          .getAttribute("href"),
      ).toBe(redirect);
      expect(screen.queryByText(/Google Drive Access Required/)).toBeNull();
      expect(
        screen.queryByText(/This connection link is unavailable/),
      ).toBeNull();
    },
  );

  it("keeps the first redirect ahead of an active sibling", () => {
    renderConnection(redirect, "initiated", {
      toolkit: "googlesheets",
      status: "active",
    });
    expect(
      screen.getByRole("link", { name: "Connect Google Drive" }),
    ).toBeTruthy();
    expect(screen.queryByText("Google Sheets Connected")).toBeNull();
  });

  it("keeps the first active result ahead of an actionable sibling", () => {
    renderConnection(undefined, "active", {
      toolkit: "googlesheets",
      redirect_url: redirect,
    });
    expect(screen.getByText("Google Drive Connected")).toBeTruthy();
    expect(
      screen.queryByRole("link", { name: "Connect Google Sheets" }),
    ).toBeNull();
  });

  it("keeps a truthy invalid redirect ahead of an active sibling", () => {
    renderConnection("http://connect.example.test", "initiated", {
      toolkit: "googlesheets",
      status: "active",
    });
    expect(screen.getByText("Google Drive Access Required")).toBeTruthy();
    expect(
      screen.getByText(
        "This connection link is unavailable. Ask for a new link.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("Google Sheets Connected")).toBeNull();
  });

  it("preserves the active connection confirmation", () => {
    renderConnection("http://unused.example.test", "active");
    expect(screen.getByText("Google Drive Connected")).toBeTruthy();
    expect(
      screen.queryByRole("link", { name: "Connect Google Drive" }),
    ).toBeNull();
    expect(
      screen.queryByText(/This connection link is unavailable/),
    ).toBeNull();
  });
});
