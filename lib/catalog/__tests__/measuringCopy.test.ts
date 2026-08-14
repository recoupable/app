import { describe, expect, it } from "vitest";
import {
  MEASURING_TITLE,
  MEASURING_ESTIMATE,
  MEASURING_BODY,
  MEASURING_TOAST_SUCCESS,
  MEASURING_TOAST_ERROR,
  measuringToastLoading,
} from "@/lib/catalog/measuringCopy";
import { getCatalogReportEmptyCopy } from "@/lib/catalog/getCatalogReportEmptyCopy";

describe("measuringCopy", () => {
  // chat#1912 row 10: the same minute of waiting was described four different
  // ways across the seeding toast, /setup/valuation, /catalogs/{id} and
  // marketing, with three different time estimates. The estimate a customer
  // gets should not depend on which surface they happen to be looking at.
  it("states the time estimate once", () => {
    expect(MEASURING_ESTIMATE).toContain("about a minute");
    expect(MEASURING_BODY).toContain(MEASURING_ESTIMATE);
  });

  it("is used by the catalog report's measuring state", () => {
    const copy = getCatalogReportEmptyCopy("measuring", {
      hasOwnCatalogs: true,
    });

    expect(copy.title).toBe(MEASURING_TITLE);
    expect(copy.body).toContain(MEASURING_ESTIMATE);
  });

  it("keeps the report's own reassurance without restating the estimate", () => {
    const copy = getCatalogReportEmptyCopy("measuring", {
      hasOwnCatalogs: true,
    });

    expect(copy.body).toContain("no need to run the valuation again");
    // The estimate must appear once in the sentence, not twice.
    expect(copy.body.split("about a minute").length - 1).toBe(1);
  });

  // Derived from the title rather than hard-coded, so the assertion fails if
  // either side drifts — the point is that they agree, not that they are any
  // particular word.
  it("uses the same verb in the seeding toast as on the pages", () => {
    const verb = MEASURING_TITLE.split(" ")[0];

    expect(verb).toBe("Measuring");
    expect(measuringToastLoading("BennyJ504")).toBe(
      `${verb} BennyJ504's catalog…`,
    );
  });

  it("states the toast outcomes", () => {
    expect(MEASURING_TOAST_SUCCESS).toBe("Your catalog is ready");
    expect(MEASURING_TOAST_ERROR).toContain("claim it later");
  });

  // House style: em dashes read as machine-written in product copy.
  it("keeps the shared copy free of em dashes", () => {
    const all = [
      MEASURING_TITLE,
      MEASURING_ESTIMATE,
      MEASURING_BODY,
      MEASURING_TOAST_SUCCESS,
      MEASURING_TOAST_ERROR,
    ].join(" ");
    expect(all).not.toMatch(/[—–]/);
  });
});
