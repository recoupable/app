import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { sendCatalogReportEmail } from "@/lib/catalog/emailReport/sendCatalogReportEmail";

vi.mock("@/lib/catalog/emailReport/sendCatalogReportEmail", () => ({
  sendCatalogReportEmail: vi.fn(),
}));

const mockSend = vi.mocked(sendCatalogReportEmail);

const CATALOG_ID = "9f3a2c9c-1b2d-4e5f-8a7b-6c5d4e3f2a1b";

const makeRequest = (body: unknown) =>
  new Request(
    `http://localhost/api/catalogs/${CATALOG_ID}/email-report`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    },
  );

const params = (catalogId: string) => ({
  params: Promise.resolve({ catalogId }),
});

describe("POST /api/catalogs/[catalogId]/email-report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the report email and returns 200", async () => {
    mockSend.mockResolvedValueOnce(true);

    const response = await POST(
      makeRequest({ email: "fan@example.com", headline_value: 1400000 }),
      params(CATALOG_ID),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledWith({
      email: "fan@example.com",
      catalogId: CATALOG_ID,
      headlineValue: 1400000,
    });
  });

  it("returns 400 for an invalid email", async () => {
    const response = await POST(
      makeRequest({ email: "nope" }),
      params(CATALOG_ID),
    );

    expect(response.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 for a non-uuid catalog id", async () => {
    const response = await POST(
      makeRequest({ email: "fan@example.com" }),
      params("not-a-uuid"),
    );

    expect(response.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed JSON body", async () => {
    const response = await POST(makeRequest("{nope"), params(CATALOG_ID));

    expect(response.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 502 when the email send fails", async () => {
    mockSend.mockResolvedValueOnce(false);

    const response = await POST(
      makeRequest({ email: "fan@example.com" }),
      params(CATALOG_ID),
    );

    expect(response.status).toBe(502);
  });
});
