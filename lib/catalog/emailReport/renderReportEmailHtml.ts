import { formatValuationAmount } from "@/lib/catalog/formatValuationAmount";

/**
 * Renders the "Email me this report" body: the headline value the viewer just
 * saw (when the report had one) plus a single button back to the live report.
 * Achromatic house style; every dynamic value is server-built (uuid-derived
 * URL, number formatted here), so nothing viewer-typed reaches the HTML.
 */
export function renderReportEmailHtml(params: {
  reportUrl: string;
  headlineValue?: number;
}): string {
  const valueBlock =
    params.headlineValue !== undefined
      ? `<p style="margin:0 0 4px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b6b6b;">Estimated catalog value</p>
        <p style="margin:0 0 24px;font-size:40px;font-weight:700;color:#111111;">${formatValuationAmount(params.headlineValue)}</p>`
      : "";

  return `
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;font-family:Helvetica,Arial,sans-serif;color:#111111;">
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#444444;">
      Here is the catalog valuation report you asked for. The live report stays
      up to date as new play counts are measured.
    </p>
    ${valueBlock}
    <a href="${params.reportUrl}"
       style="display:inline-block;padding:12px 24px;background:#111111;color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;">
      View your report
    </a>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6b6b6b;">
      Directional model, not an appraisal. Sent by Recoup because you requested
      this report at chat.recoupable.dev.
    </p>
  </div>`;
}
