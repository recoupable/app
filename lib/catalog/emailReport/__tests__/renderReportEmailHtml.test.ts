import { describe, it, expect } from "vitest";
import { renderReportEmailHtml } from "../renderReportEmailHtml";

const REPORT_URL =
  "https://chat.recoupable.dev/catalogs/9f3a2c9c-1b2d-4e5f-8a7b-6c5d4e3f2a1b";

describe("renderReportEmailHtml", () => {
  it("links to the report", () => {
    const html = renderReportEmailHtml({ reportUrl: REPORT_URL });
    expect(html).toContain(`href="${REPORT_URL}"`);
  });

  it("shows the formatted headline value when provided", () => {
    const html = renderReportEmailHtml({
      reportUrl: REPORT_URL,
      headlineValue: 1400000,
    });
    expect(html).toContain("$1.4M");
  });

  it("omits the value line when no headline value is provided", () => {
    const html = renderReportEmailHtml({ reportUrl: REPORT_URL });
    expect(html).not.toContain("Estimated catalog value");
  });

  it("contains no em or en dashes", () => {
    const html = renderReportEmailHtml({
      reportUrl: REPORT_URL,
      headlineValue: 959000,
    });
    expect(html).not.toMatch(/[–—]/);
  });
});
