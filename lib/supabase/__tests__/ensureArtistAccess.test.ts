import { describe, it, expect, vi, beforeEach } from "vitest";

// Import after mocks
import { ensureArtistAccess } from "../ensureArtistAccess";

// Create chainable mock for Supabase queries
const createChainableMock = () => {
  const chain: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    resolvedData: { data: unknown; error: unknown } | null;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    insert: vi.fn(),
    resolvedData: null,
  };

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.single.mockImplementation(() => Promise.resolve(chain.resolvedData));
  chain.maybeSingle.mockImplementation(() => Promise.resolve(chain.resolvedData));
  chain.insert.mockImplementation(() => Promise.resolve(chain.resolvedData));

  return chain;
};

// Create mock for each table
const accountsChain = createChainableMock();
const accountArtistIdsChain = createChainableMock();

// Mock supabase
vi.mock("../serverClient", () => ({
  default: {
    from: vi.fn((table: string) => {
      if (table === "accounts") return accountsChain;
      if (table === "account_artist_ids") return accountArtistIdsChain;
      return createChainableMock();
    }),
  },
}));

describe("ensureArtistAccess", () => {
  const mockArtistId = "artist-123";
  const mockAccountId = "account-456";

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset chain mocks
    accountsChain.select.mockReturnValue(accountsChain);
    accountsChain.eq.mockReturnValue(accountsChain);
    accountArtistIdsChain.select.mockReturnValue(accountArtistIdsChain);
    accountArtistIdsChain.eq.mockReturnValue(accountArtistIdsChain);
  });

  describe("basic functionality", () => {
    it("returns false when artist does not exist", async () => {
      accountsChain.resolvedData = { data: null, error: { message: "Not found" } };
      accountArtistIdsChain.resolvedData = { data: null, error: null };

      const result = await ensureArtistAccess(mockArtistId, mockAccountId);

      expect(result).toBe(false);
    });

    it("returns false when user already has access", async () => {
      accountsChain.resolvedData = { data: { id: mockArtistId }, error: null };
      accountArtistIdsChain.resolvedData = {
        data: { artist_id: mockArtistId },
        error: null,
      };

      const result = await ensureArtistAccess(mockArtistId, mockAccountId);

      expect(result).toBe(false);
    });

    it("grants access and returns true when artist exists and user has no access", async () => {
      accountsChain.resolvedData = { data: { id: mockArtistId }, error: null };
      // First call for maybeSingle (checking access)
      accountArtistIdsChain.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });
      // Second call for insert (granting access)
      accountArtistIdsChain.insert.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await ensureArtistAccess(mockArtistId, mockAccountId);

      expect(result).toBe(true);
    });

    it("returns false when insert fails", async () => {
      accountsChain.resolvedData = { data: { id: mockArtistId }, error: null };
      accountArtistIdsChain.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });
      accountArtistIdsChain.insert.mockResolvedValueOnce({
        data: null,
        error: { message: "Insert failed" },
      });

      const result = await ensureArtistAccess(mockArtistId, mockAccountId);

      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    it("returns false on exception", async () => {
      accountsChain.single.mockRejectedValueOnce(new Error("Database error"));

      const result = await ensureArtistAccess(mockArtistId, mockAccountId);

      expect(result).toBe(false);
    });
  });

  describe("parallel execution", () => {
    it("runs artist check and access check in parallel", async () => {
      const executionOrder: string[] = [];

      // Track when each operation starts and completes
      accountsChain.single.mockImplementation(async () => {
        executionOrder.push("artistCheck:start");
        await new Promise(resolve => setTimeout(resolve, 10));
        executionOrder.push("artistCheck:end");
        return { data: { id: mockArtistId }, error: null };
      });

      accountArtistIdsChain.maybeSingle.mockImplementation(async () => {
        executionOrder.push("accessCheck:start");
        await new Promise(resolve => setTimeout(resolve, 10));
        executionOrder.push("accessCheck:end");
        return { data: { artist_id: mockArtistId }, error: null }; // User already has access
      });

      await ensureArtistAccess(mockArtistId, mockAccountId);

      // Both should start before either ends (parallel execution)
      const artistStartIndex = executionOrder.indexOf("artistCheck:start");
      const accessStartIndex = executionOrder.indexOf("accessCheck:start");
      const artistEndIndex = executionOrder.indexOf("artistCheck:end");
      const accessEndIndex = executionOrder.indexOf("accessCheck:end");

      // Both operations should have started
      expect(artistStartIndex).toBeGreaterThanOrEqual(0);
      expect(accessStartIndex).toBeGreaterThanOrEqual(0);

      // Both starts should come before both ends
      expect(artistStartIndex).toBeLessThan(artistEndIndex);
      expect(accessStartIndex).toBeLessThan(accessEndIndex);

      // At least one start should come before the other's end (proves parallelism)
      const bothStartedBeforeAnyEnds =
        Math.max(artistStartIndex, accessStartIndex) < Math.min(artistEndIndex, accessEndIndex);
      expect(bothStartedBeforeAnyEnds).toBe(true);
    });

    it("both database queries are initiated", async () => {
      accountsChain.single.mockResolvedValue({
        data: { id: mockArtistId },
        error: null,
      });
      accountArtistIdsChain.maybeSingle.mockResolvedValue({
        data: { artist_id: mockArtistId },
        error: null,
      });

      await ensureArtistAccess(mockArtistId, mockAccountId);

      // Both select operations should have been called
      expect(accountsChain.select).toHaveBeenCalled();
      expect(accountArtistIdsChain.select).toHaveBeenCalled();
    });
  });
});
