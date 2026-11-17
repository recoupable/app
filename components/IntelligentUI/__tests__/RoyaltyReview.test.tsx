// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import PlaygroundWorkspace from "../PlaygroundWorkspace";
import { royaltyScenario } from "@/lib/intelligent-ui/playground/royalty/royaltyScenario";
import { getCompletedExample } from "@/lib/intelligent-ui/playground/getCompletedExample";
import { conversationExamples } from "@/lib/intelligent-ui/playground/conversationExamples";
import result from "@/lib/intelligent-ui/playground/royalty/result.json";

afterEach(cleanup);

it("preserves the producer's allocation evidence and unknown payable through replay", () => {
  const surface = getCompletedExample(royaltyScenario);
  for (const allocation of result.allocations) {
    for (const ref of allocation.evidence_refs) {
      expect(surface.evidence.find((item) => item.id === ref)?.text).toContain(
        ref,
      );
    }
  }
  expect(surface.fallbackText).toContain("Current payable: Unknown");
  expect(surface.fallbackText).toContain("USD -3");
  expect(surface.fallbackText).toContain("USD 97");
  expect(surface.fallbackText).toContain("supplied_statement_only");
});

it("renders the supplied amounts and opens citations with keyboard focus restoration", async () => {
  render(
    <PlaygroundWorkspace
      scenario={royaltyScenario}
      example={
        conversationExamples.find((item) => item.scenarioId === "royalty")!
      }
    />,
  );
  const table = screen.getByRole("table");
  expect(within(table).getAllByText("USD 100")).toHaveLength(2);
  expect(within(table).getByText("USD -3")).toBeTruthy();
  expect(within(table).getByText("USD 97")).toBeTruthy();
  expect(screen.getByText("Current payable: Unknown.")).toBeTruthy();
  const source = screen.getByRole("button", {
    name: "synthetic-bank:fee-row · partial",
  });
  source.focus();
  fireEvent.click(source);
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByText(/FEE-1/)).toBeTruthy();
  fireEvent.keyDown(dialog, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(source));
});
