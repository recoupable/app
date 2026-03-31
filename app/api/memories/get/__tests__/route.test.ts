import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";

const mockValidateHeaders = vi.fn();
const mockGetRoom = vi.fn();
const mockQueryMemories = vi.fn();

vi.mock("@/lib/chat/validateHeaders", () => ({
  validateHeaders: (...args: unknown[]) => mockValidateHeaders(...args),
}));

vi.mock("@/lib/supabase/getRoom", () => ({
  default: (...args: unknown[]) => mockGetRoom(...args),
}));

vi.mock("@/lib/supabase/queryMemories", () => ({
  default: (...args: unknown[]) => mockQueryMemories(...args),
}));

describe("GET /api/memories/get", () => {
  const roomId = "11111111-1111-1111-1111-111111111111";
  const accountId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when roomId is missing", async () => {
    const req = new NextRequest("https://example.com/api/memories/get");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Room ID is required");
  });

  it("returns 401 when not authenticated", async () => {
    mockValidateHeaders.mockResolvedValueOnce({});

    const req = new NextRequest(
      `https://example.com/api/memories/get?roomId=${roomId}`,
    );
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("forwards validateHeaders error Response", async () => {
    const errorRes = new Response(JSON.stringify({ status: "error" }), {
      status: 401,
    });
    mockValidateHeaders.mockResolvedValueOnce(errorRes);

    const req = new NextRequest(
      `https://example.com/api/memories/get?roomId=${roomId}`,
      { headers: { Authorization: "Bearer bad" } },
    );
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 404 when room does not exist", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId });
    mockGetRoom.mockResolvedValueOnce(null);

    const req = new NextRequest(
      `https://example.com/api/memories/get?roomId=${roomId}`,
      { headers: { Authorization: "Bearer token" } },
    );
    const res = await GET(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Room not found");
  });

  it("returns 403 when room belongs to another account", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId });
    mockGetRoom.mockResolvedValueOnce({
      id: roomId,
      account_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    });

    const req = new NextRequest(
      `https://example.com/api/memories/get?roomId=${roomId}`,
      { headers: { Authorization: "Bearer token" } },
    );
    const res = await GET(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Forbidden");
  });

  it("returns 200 with memories when caller owns the room", async () => {
    const memories = [{ id: "m1", room_id: roomId, content: {}, updated_at: "" }];
    mockValidateHeaders.mockResolvedValueOnce({ accountId });
    mockGetRoom.mockResolvedValueOnce({
      id: roomId,
      account_id: accountId,
    });
    mockQueryMemories.mockResolvedValueOnce({
      data: memories,
      error: null,
    });

    const req = new NextRequest(
      `https://example.com/api/memories/get?roomId=${roomId}`,
      { headers: { Authorization: "Bearer token" } },
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(memories);
    expect(mockQueryMemories).toHaveBeenCalledWith(roomId, { ascending: true });
  });

  it("returns 400 when queryMemories fails", async () => {
    mockValidateHeaders.mockResolvedValueOnce({ accountId });
    mockGetRoom.mockResolvedValueOnce({
      id: roomId,
      account_id: accountId,
    });
    mockQueryMemories.mockResolvedValueOnce({
      data: null,
      error: { message: "db error" },
    });

    const req = new NextRequest(
      `https://example.com/api/memories/get?roomId=${roomId}`,
      { headers: { Authorization: "Bearer token" } },
    );
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});
