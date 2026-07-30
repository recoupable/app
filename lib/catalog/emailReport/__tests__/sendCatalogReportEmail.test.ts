import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendCatalogReportEmail } from "../sendCatalogReportEmail";
import sendEmail from "@/lib/email/sendEmail";
import { APP_BASE_URL, RECOUP_FROM_EMAIL } from "@/lib/consts";

vi.mock("@/lib/email/sendEmail", () => ({ default: vi.fn() }));

const mockSendEmail = vi.mocked(sendEmail);

const CATALOG_ID = "9f3a2c9c-1b2d-4e5f-8a7b-6c5d4e3f2a1b";

describe("sendCatalogReportEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends from the Recoup address to the viewer with the report link", async () => {
    mockSendEmail.mockResolvedValueOnce({ ok: true } as Response);

    const sent = await sendCatalogReportEmail({
      email: "fan@example.com",
      catalogId: CATALOG_ID,
      headlineValue: 1400000,
    });

    expect(sent).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const args = mockSendEmail.mock.calls[0][0];
    expect(args.from).toBe(RECOUP_FROM_EMAIL);
    expect(args.to).toBe("fan@example.com");
    expect(args.subject).toContain("$1.4M");
    expect(args.html).toContain(`${APP_BASE_URL}/catalogs/${CATALOG_ID}`);
  });

  it("uses a generic subject when no headline value is provided", async () => {
    mockSendEmail.mockResolvedValueOnce({ ok: true } as Response);

    await sendCatalogReportEmail({
      email: "fan@example.com",
      catalogId: CATALOG_ID,
    });

    const args = mockSendEmail.mock.calls[0][0];
    expect(args.subject).toBe("Your catalog valuation report");
  });

  it("returns false when the send fails", async () => {
    mockSendEmail.mockResolvedValueOnce({ ok: false } as Response);

    const sent = await sendCatalogReportEmail({
      email: "fan@example.com",
      catalogId: CATALOG_ID,
    });

    expect(sent).toBe(false);
  });

  it("returns false when the send path returns an empty result", async () => {
    mockSendEmail.mockResolvedValueOnce("");

    const sent = await sendCatalogReportEmail({
      email: "fan@example.com",
      catalogId: CATALOG_ID,
    });

    expect(sent).toBe(false);
  });
});
