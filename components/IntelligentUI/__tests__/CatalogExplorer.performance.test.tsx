// @vitest-environment jsdom
import { performance } from "node:perf_hooks";
import { writeFileSync } from "node:fs";
import { cpus, platform, arch } from "node:os";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import CatalogExplorer from "../CatalogExplorer";
import { createCatalogExplorerFixture } from "@/lib/intelligent-ui/playground/catalog/createCatalogExplorerFixture";
import { getCatalogExplorerView } from "@/lib/intelligent-ui/playground/catalog/getCatalogExplorerView";

it.skipIf(!process.env.CATALOG_EXPLORER_MEASUREMENT)(
  "measures bounded 10,000-record local work (not browser latency)",
  () => {
    const summary = (samples: number[]) => {
      const sorted = [...samples].sort((a, b) => a - b);
      return {
        samples: samples.length,
        medianMs: sorted[Math.floor(sorted.length / 2)],
        p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
        maximumMs: sorted.at(-1),
      };
    };
    const start = performance.now();
    const records = createCatalogExplorerFixture();
    const fixtureMs = performance.now() - start;
    const queryTimes: number[] = [];
    for (let i = 0; i < 110; i++) {
      const at = performance.now();
      const view = getCatalogExplorerView(records, {
        query: i % 2 ? "Recording" : "",
        cohort: i % 3 ? "all" : "luminate",
        descending: !!(i % 2),
        page: 10,
      });
      if (i >= 10) queryTimes.push(performance.now() - at);
      expect(view.rows.length).toBeLessThanOrEqual(25);
    }
    const mount = performance.now();
    render(<CatalogExplorer />);
    const jsdomMountMs = performance.now() - mount;
    const interactions: number[] = [];
    let maximumDomRows = 0;
    for (let i = 0; i < 30; i++) {
      const at = performance.now();
      fireEvent.change(
        screen.getByRole("combobox", { name: "Source cohort" }),
        { target: { value: i % 2 ? "all" : "luminate" } },
      );
      interactions.push(performance.now() - at);
      maximumDomRows = Math.max(
        maximumDomRows,
        screen.getAllByRole("row").length,
      );
    }
    expect(maximumDomRows).toBe(26);
    writeFileSync(
      process.env.CATALOG_EXPLORER_MEASUREMENT!,
      JSON.stringify(
        {
          scope:
            "Synthetic local fixture; Node pure queries and React/jsdom commits. Not browser paint, hosted latency, authenticated data, or a performance SLA.",
          records: records.length,
          pageSize: 25,
          maximumDomRows,
          selectionLimit: 8,
          environment: {
            node: process.version,
            platform: platform(),
            arch: arch(),
            cpu: cpus()[0]?.model,
          },
          fixtureMs,
          query: summary(queryTimes),
          jsdomMountMs,
          jsdomCohortChange: summary(interactions),
        },
        null,
        2,
      ) + "\n",
    );
    cleanup();
  },
);
