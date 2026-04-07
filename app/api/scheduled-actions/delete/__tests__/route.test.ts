import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE } from "../route";
import { validateHeaders } from "@/lib/chat/validateHeaders";
import { checkAccountArtistAccess } from "@/lib/supabase/account_artist_ids/checkAccountArtistAccess";
import { deleteScheduledActionById } from "@/lib/supabase/scheduled_actions/deleteScheduledActionById";
import { selectScheduledActionById } from "@/lib/supabase/scheduled_actions/selectScheduledActionById";

vi.mock("@/lib/chat/validateHeaders", () => ({
  validateHeaders: vi.fn(),
}));

vi.mock("@/lib/supabase/account_artist_ids/checkAccountArtistAccess", () => ({
  checkAccountArtistAccess: vi.fn(),
}));

vi.mock("@/lib/supabase/scheduled_actions/selectScheduledActionById", () => ({
  selectScheduledActionById: vi.fn(),
}));

vi.mock("@/lib/supabase/scheduled_actions/deleteScheduledActionById", () => ({
  deleteScheduledActionById: vi.fn(),
}));

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/scheduled-actions/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("DELETE /api/scheduled-actions/delete", () => {
  const mockValidateHeaders = vi.mocked(validateHeaders);
  const mockCheckAccountArtistAccess = vi.mocked(checkAccountArtistAccess);
  const mockSelectScheduledActionById = vi.mocked(selectScheduledActionById);
  const mockDeleteScheduledActionById = vi.mocked(deleteScheduledActionById);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when caller is unauthenticated", async () => {
    mockValidateHeaders.mockResolvedValueOnce({});

    const response = await DELETE(makeRequest({ id: "1e632dc8-94aa-4f85-9f85-241213d0d2f9" }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
    expect(mockSelectScheduledActionById).not.toHaveBeenCalled();
  });

  it("returns 400 when id is missing or invalid", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "account-123" });

    const response = await DELETE(makeRequest({ id: "not-a-uuid" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("UUID");
    expect(mockSelectScheduledActionById).not.toHaveBeenCalled();
  });

  it("returns 404 when task does not exist", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "account-123" });
    mockSelectScheduledActionById.mockResolvedValueOnce({
      data: null,
      error: null,
    } as Awaited<ReturnType<typeof selectScheduledActionById>>);

    const response = await DELETE(makeRequest({ id: "1e632dc8-94aa-4f85-9f85-241213d0d2f9" }));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: "Task not found" });
  });

  it("returns 403 when caller is not owner and lacks artist access", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "account-123" });
    mockCheckAccountArtistAccess.mockResolvedValueOnce(false);
    mockSelectScheduledActionById.mockResolvedValueOnce({
      data: {
        id: "1e632dc8-94aa-4f85-9f85-241213d0d2f9",
        account_id: "other-account",
        artist_account_id: "artist-456",
      },
      error: null,
    } as Awaited<ReturnType<typeof selectScheduledActionById>>);

    const response = await DELETE(makeRequest({ id: "1e632dc8-94aa-4f85-9f85-241213d0d2f9" }));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: "Forbidden" });
    expect(mockDeleteScheduledActionById).not.toHaveBeenCalled();
  });

  it("returns 200 and deletes when caller owns the task", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId: "account-123" });
    mockSelectScheduledActionById.mockResolvedValueOnce({
      data: {
        id: "1e632dc8-94aa-4f85-9f85-241213d0d2f9",
        account_id: "account-123",
        artist_account_id: "artist-456",
      },
      error: null,
    } as Awaited<ReturnType<typeof selectScheduledActionById>>);
    mockDeleteScheduledActionById.mockResolvedValueOnce({
      error: null,
    } as Awaited<ReturnType<typeof deleteScheduledActionById>>);

    const response = await DELETE(makeRequest({ id: "1e632dc8-94aa-4f85-9f85-241213d0d2f9" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(mockCheckAccountArtistAccess).not.toHaveBeenCalled();
    expect(mockDeleteScheduledActionById).toHaveBeenCalledTimes(1);
    expect(mockDeleteScheduledActionById).toHaveBeenCalledWith(
      "1e632dc8-94aa-4f85-9f85-241213d0d2f9"
    );
  });
});
