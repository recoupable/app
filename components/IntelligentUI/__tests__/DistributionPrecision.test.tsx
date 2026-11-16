// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { distributionSchema } from "@/lib/intelligent-ui/representations/schemas";
import { getRepresentationText } from "@/lib/intelligent-ui/representations/getRepresentationText";
import DistributionView from "../DistributionView";

afterEach(cleanup);

describe("distribution measurement fidelity", () => {
  it.each([
    [0, "0"],
    [1e12, "1,000,000,000,000"],
    [0.0000012345678901234567, "0.0000012345678901234567"],
    [0.0001, "0.0001"],
    [0.00051, "0.00051"],
    [1.2345678901234567, "1.2345678901234567"],
    [123456789012.34567, "123,456,789,012.34567"],
    [1e-7, "1e-7"],
    [Number.MIN_VALUE, "5e-324"],
  ])("preserves %s in the chart and text alternative", (value, displayed) => {
    const component = distributionSchema.parse({
      type: "distribution",
      id: "precision-check",
      title: "Synthetic precision check",
      measure: {
        label: "Supplied measurement",
        unit: "observations",
        periodStart: "2026-09-01",
        periodEnd: "2026-09-30",
        population: "One synthetic record",
      },
      items: [{ id: "sample", label: "Sample", value, evidenceIds: [] }],
      complete: true,
      totalCount: 1,
    });
    render(<DistributionView component={component} />);
    const figure = screen.getByRole("figure", {
      name: "Synthetic precision check",
    });
    const row = within(figure).getByRole("listitem");
    expect(within(row).getByText(displayed).textContent).toBe(
      `${displayed} observations`,
    );
    expect(figure.querySelector("figcaption")?.textContent).toContain(
      `${displayed} supplied observations`,
    );
    const alternative = getRepresentationText(component);
    expect(alternative).toContain(`Sample: ${displayed} observations`);
    expect(alternative).toContain(`Total supplied: ${displayed} observations.`);
  });
});
