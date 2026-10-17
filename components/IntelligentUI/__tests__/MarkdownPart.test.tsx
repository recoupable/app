// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import MarkdownPart from "../MarkdownPart";

afterEach(cleanup);

describe("ordinary Markdown safety", () => {
  it("preserves text when unsupported formatting is removed", () => {
    render(
      <MarkdownPart
        text={
          "## Summary\n\n```text\nKeep this example\n```\n\n~~Earlier wording~~"
        }
      />,
    );
    expect(screen.getByText("Summary")).toBeTruthy();
    expect(screen.getByText("Keep this example")).toBeTruthy();
    expect(screen.getByText("Earlier wording")).toBeTruthy();
  });
  it("does not render raw HTML, executable links or remote images", () => {
    const { container } = render(
      <MarkdownPart
        text={
          "<script>alert(1)</script>\n\n[bad](javascript:alert) ![remote](https://example.com/pixel.png)"
        }
      />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("bad")).toBeTruthy();
    expect(container.querySelector("a")).toBeNull();
  });
  it("retains semantic tables and safe, clearly external source links", () => {
    render(
      <MarkdownPart
        text={
          "| Supplier | Quote |\n| --- | ---: |\n| Northline | $2,400 |\n\n[source](https://example.com/quote)"
        }
      />,
    );
    expect(screen.getByRole("table")).toBeTruthy();
    const link = screen.getByRole("link", { name: /source/ });
    expect(link.getAttribute("href")).toBe("https://example.com/quote");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });
});
