// @vitest-environment jsdom
import { webcrypto } from "node:crypto";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AnnualCatalogScenario from "../AnnualCatalogScenario";
import CatalogExplorer from "../CatalogExplorer";
import { runScenario } from "@/lib/intelligent-ui/playground/catalog/scenario/vendor/scenario.mjs";
import type { ScenarioResult } from "@/lib/intelligent-ui/playground/catalog/scenario/scenarioTypes";
vi.mock(
  "@/lib/intelligent-ui/playground/catalog/scenario/vendor/scenario.mjs",
  async (original) => {
    const actual =
      await original<
        typeof import("@/lib/intelligent-ui/playground/catalog/scenario/vendor/scenario.mjs")
      >();
    return { ...actual, runScenario: vi.fn(actual.runScenario) };
  },
);
const run = vi.mocked(runScenario);
const receipt = () =>
  JSON.parse(
    (screen.getByLabelText("Annual scenario receipt") as HTMLTextAreaElement)
      .value,
  );
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  run.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("uses canonical annual values, keeps observations and full provenance, and resets", async () => {
  render(<AnnualCatalogScenario />);
  await waitFor(() => expect(receipt().scenario.value.central).toBe(20));
  const baseline = receipt();
  fireEvent.change(
    screen.getByRole("textbox", {
      name: "Hypothetical USD per Spotify stream",
    }),
    { target: { value: "0.008" } },
  );
  expect(screen.queryByLabelText("Annual scenario receipt")).toBeNull();
  await waitFor(() => expect(receipt().scenario.value.central).toBe(40));
  expect(receipt().observations).toEqual(baseline.observations);
  expect(receipt().observations_sha256).toBe(baseline.observations_sha256);
  expect(receipt().baseline_assumptions.rates.spotify).toBe(0.004);
  expect(receipt().scenario_assumptions.rates.spotify).toBe(0.008);
  expect(receipt().selection[0].authority).toBe("fixture");
  expect(receipt().consumption.sha256["scenario.mjs"]).toBe(
    "0cd92009fe39e237cafb44d033c4e1488b9811d783fdf000ec89b279893117ce",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Reset rate to baseline" }),
  );
  await waitFor(() => expect(receipt().reset_to_baseline).toBe(true));
  expect(receipt().scenario).toEqual(baseline.scenario);
});
it("refuses invalid rates and empty selections, retains unknown without zero", async () => {
  render(<AnnualCatalogScenario />);
  await waitFor(() => expect(receipt().scenario.value.central).toBe(20));
  fireEvent.change(
    screen.getByRole("textbox", {
      name: "Hypothetical USD per Spotify stream",
    }),
    { target: { value: "-1" } },
  );
  expect(screen.getByRole("alert").textContent).toContain("nonnegative");
  expect(screen.queryByLabelText("Annual scenario receipt")).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Reset rate to baseline" }),
  );
  fireEvent.click(screen.getByRole("checkbox", { name: /Synthetic A/ }));
  await waitFor(() =>
    expect(receipt().scenario.status).toBe("insufficient_measurement"),
  );
  expect(receipt().scenario.value.central).toBeNull();
  fireEvent.click(screen.getByRole("checkbox", { name: /Unknown/ }));
  expect(screen.getByRole("alert").textContent).toContain("Select available");
});
it("drops late results and errors across rate edits and reset", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/intelligent-ui/playground/catalog/scenario/vendor/scenario.mjs")
  >("@/lib/intelligent-ui/playground/catalog/scenario/vendor/scenario.mjs");
  const pending: {
    resolve: (r: ScenarioResult) => void;
    reject: (e: Error) => void;
    result: Promise<ScenarioResult>;
  }[] = [];
  run.mockImplementation(
    (request) =>
      new Promise((resolve, reject) => {
        pending.push({ resolve, reject, result: actual.runScenario(request) });
      }),
  );
  render(<AnnualCatalogScenario />);
  fireEvent.change(
    screen.getByRole("textbox", {
      name: "Hypothetical USD per Spotify stream",
    }),
    { target: { value: "0.008" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Reset rate to baseline" }),
  );
  expect(pending).toHaveLength(3);
  await act(async () => pending[2].resolve(await pending[2].result));
  expect(receipt().scenario.value.central).toBe(20);
  await act(async () => pending[1].resolve(await pending[1].result));
  await act(async () => pending[0].reject(new Error("obsolete failure")));
  expect(receipt().scenario.value.central).toBe(20);
  expect(screen.queryByRole("alert")).toBeNull();
  run.mockImplementation(actual.runScenario);
});
it("announces local runtime errors without retaining stale outputs", async () => {
  run.mockRejectedValueOnce(new Error("Local Web Crypto SHA256 unavailable"));
  render(<AnnualCatalogScenario />);
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain("Web Crypto"),
  );
  expect(screen.queryByLabelText("Annual scenario receipt")).toBeNull();
});

it("keeps annual controls separate from the original explorer observations and selection", async () => {
  const fetchSpy = vi.fn();
  vi.stubGlobal("fetch", fetchSpy);
  render(<CatalogExplorer />);
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Select Recording 00005" }),
  );
  const original = (
    screen.getByLabelText("Source-preserving text") as HTMLTextAreaElement
  ).value;
  expect(run).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Explore separate annual scenario" }),
  );
  await waitFor(() => expect(receipt().scenario.value.central).toBe(20));
  fireEvent.change(
    screen.getByRole("textbox", {
      name: "Hypothetical USD per Spotify stream",
    }),
    { target: { value: "0.008" } },
  );
  await waitFor(() => expect(receipt().scenario.value.central).toBe(40));
  expect(
    (screen.getByLabelText("Source-preserving text") as HTMLTextAreaElement)
      .value,
  ).toBe(original);
  expect(screen.getAllByRole("row")).toHaveLength(26);
  expect(fetchSpy).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Close annual scenario" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Explore separate annual scenario" }),
  );
  await waitFor(() => expect(receipt().reset_to_baseline).toBe(true));
  expect(receipt().selection).toHaveLength(2);
});
