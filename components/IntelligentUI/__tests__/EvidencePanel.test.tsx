// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Evidence } from "@/lib/intelligent-ui/schema";
import EvidencePanel from "../EvidencePanel";

afterEach(cleanup);

const evidence: Evidence = {
  id: "source-a",
  label: "Example planning note",
  sourceLabel: "Synthetic example · no customer data",
  observedAt: "2026-10-16T12:00:00Z",
  kind: "derived",
  status: "partial",
  text: "This is a synthetic estimate, not a measured result.",
  href: "https://example.com/source",
};

describe("EvidencePanel", () => {
  it("provides a useful empty state and source, time, kind, and completeness metadata", () => {
    const { rerender } = render(
      <EvidencePanel evidence={null} onClose={vi.fn()} />,
    );
    expect(
      screen.getByRole("heading", { name: "Follow the evidence." }),
    ).toBeTruthy();
    rerender(<EvidencePanel evidence={evidence} onClose={vi.fn()} />);
    expect(screen.getByText(evidence.sourceLabel)).toBeTruthy();
    expect(screen.getByText("Derived")).toBeTruthy();
    expect(screen.getByText("Partial")).toBeTruthy();
    expect(screen.getByText(/This source is incomplete/)).toBeTruthy();
    expect(screen.getByText(/Oct 16, 2026.*UTC/).getAttribute("datetime")).toBe(
      evidence.observedAt,
    );
  });

  it("does not steal focus on restore and responds to repeated explicit inspection of the same evidence", () => {
    const { rerender } = render(
      <>
        <button>Existing control</button>
        <EvidencePanel evidence={null} onClose={vi.fn()} />
      </>,
    );
    const control = screen.getByRole("button", { name: "Existing control" });
    control.focus();
    rerender(
      <>
        <button>Existing control</button>
        <EvidencePanel evidence={evidence} onClose={vi.fn()} />
      </>,
    );
    expect(document.activeElement).toBe(control);
    rerender(
      <>
        <button>Existing control</button>
        <EvidencePanel evidence={evidence} onClose={vi.fn()} focusRequest={1} />
      </>,
    );
    const heading = screen.getByRole("heading", { name: evidence.label });
    expect(document.activeElement).toBe(heading);
    control.focus();
    rerender(
      <>
        <button>Existing control</button>
        <EvidencePanel evidence={evidence} onClose={vi.fn()} focusRequest={2} />
      </>,
    );
    expect(document.activeElement).toBe(heading);
  });

  it("restores the trigger's focus when the inspector is closed", () => {
    const Harness = () => {
      const [selected, setSelected] = useState<Evidence | null>(null);
      const [focusRequest, setFocusRequest] = useState(0);
      return (
        <>
          <button
            onClick={() => {
              setSelected(evidence);
              setFocusRequest((request) => request + 1);
            }}
          >
            Inspect example
          </button>
          <EvidencePanel
            evidence={selected}
            onClose={() => setSelected(null)}
            focusRequest={focusRequest}
          />
        </>
      );
    };
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Inspect example" });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(
      screen.getByRole("button", { name: "Close evidence inspector" }),
    );
    expect(document.activeElement).toBe(trigger);
    expect(
      screen.getByRole("heading", { name: "Follow the evidence." }),
    ).toBeTruthy();
  });

  it("opens credential-free HTTPS links safely and suppresses unsafe links even if validation was bypassed", () => {
    const { rerender } = render(
      <EvidencePanel evidence={evidence} onClose={vi.fn()} />,
    );
    const link = screen.getByRole("link", { name: /Open source/ });
    expect(link.getAttribute("href")).toBe(evidence.href);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noreferrer");
    for (const href of [
      "javascript:alert(1)",
      "http://example.com",
      "https://user:secret@example.com",
    ]) {
      rerender(
        <EvidencePanel evidence={{ ...evidence, href }} onClose={vi.fn()} />,
      );
      expect(screen.queryByRole("link")).toBeNull();
    }
  });

  it("makes withdrawn evidence explicit and does not interpret markup in source text", () => {
    const text = "<script>alert('example')</script>";
    const { container } = render(
      <EvidencePanel
        evidence={{ ...evidence, status: "withdrawn", text }}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Withdrawn")).toBeTruthy();
    expect(
      screen.getByText(/should not support a current decision/),
    ).toBeTruthy();
    expect(screen.getByText(text)).toBeTruthy();
    expect(container.querySelector("script")).toBeNull();
  });
});
