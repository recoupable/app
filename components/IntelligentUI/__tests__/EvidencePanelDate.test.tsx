// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import EvidencePanel from "../EvidencePanel";

afterEach(cleanup);

describe("EvidencePanel date fallback", () => {
  it.each(["", "not-a-date", "999999999999999999"])(
    "does not crash if a caller supplies the invalid timestamp %j",
    (observedAt) => {
      const { container } = render(
        <EvidencePanel
          evidence={{
            id: "example",
            label: "Example note",
            sourceLabel: "Synthetic data",
            observedAt,
            kind: "submitted",
            status: "current",
            text: "Example source text.",
          }}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText("Date unavailable")).toBeTruthy();
      expect(screen.getByText("Example source text.")).toBeTruthy();
      expect(container.querySelector("time")).toBeNull();
    },
  );
});
