import sendEmail from "@/lib/email/sendEmail";
import { APP_BASE_URL, RECOUP_FROM_EMAIL } from "@/lib/consts";
import { formatValuationAmount } from "@/lib/catalog/formatValuationAmount";
import { renderReportEmailHtml } from "@/lib/catalog/emailReport/renderReportEmailHtml";

/**
 * Sends the catalog report link (and headline value when the viewer's report
 * had one) to the address an anonymous viewer typed on /catalogs/[catalogId]
 * (chat#1902 item C3). Goes out through the chat repo's direct Resend path.
 *
 * @returns true when Resend accepted the send
 */
export async function sendCatalogReportEmail(params: {
  email: string;
  catalogId: string;
  headlineValue?: number;
}): Promise<boolean> {
  const reportUrl = `${APP_BASE_URL}/catalogs/${params.catalogId}`;
  const subject =
    params.headlineValue !== undefined
      ? `Your catalog valuation report: ${formatValuationAmount(params.headlineValue)}`
      : "Your catalog valuation report";

  const response = await sendEmail({
    from: RECOUP_FROM_EMAIL,
    to: params.email,
    subject,
    html: renderReportEmailHtml({
      reportUrl,
      headlineValue: params.headlineValue,
    }),
  });

  return typeof response !== "string" && response.ok;
}
