import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AccountWithDetails } from "@/lib/supabase/accounts/getAccountWithDetails";

vi.mock("@/lib/accounts/fetchOrCreateAccount", () => ({
  fetchOrCreateAccount: vi.fn(),
}));

const account = (id: string): AccountWithDetails =>
  ({ account_id: id }) as AccountWithDetails;

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mimics POST /api/accounts semantics: read-then-write keyed by email.
 * Concurrent calls both miss the read and each create a row (the chat#1875
 * orphan bug); serialized calls resolve to the same row.
 */
function makeRaceyApi() {
  const rows = new Map<string, string>();
  let creates = 0;
  const impl = async ({ email }: { email?: string }) => {
    const existing = email ? rows.get(email) : undefined;
    await tick(); // simulate network gap between read and write
    if (existing) return account(existing);
    creates += 1;
    const id = `account-${creates}`;
    if (email) rows.set(email, id);
    return account(id);
  };
  return { impl, rowCount: () => rows.size, createCount: () => creates };
}

async function loadModules() {
  vi.resetModules();
  const { ensureAccount } = await import("@/lib/accounts/ensureAccount");
  const { fetchOrCreateAccount } = await import(
    "@/lib/accounts/fetchOrCreateAccount"
  );
  return {
    ensureAccount,
    fetchOrCreateAccount: vi.mocked(fetchOrCreateAccount),
  };
}

describe("ensureAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("serializes distinct concurrent calls so only one account is created", async () => {
    const { ensureAccount, fetchOrCreateAccount } = await loadModules();
    const api = makeRaceyApi();
    fetchOrCreateAccount.mockImplementation(api.impl);

    // Path 1: fires right after passwordless/authenticate (email only).
    // Path 2: fires right after embedded-wallet creation (email + wallet).
    const [first, second] = await Promise.all([
      ensureAccount({ email: "new@user.com", accessToken: "token" }),
      ensureAccount({
        email: "new@user.com",
        wallet: "0xabc",
        accessToken: "token",
      }),
    ]);

    expect(api.createCount()).toBe(1);
    expect(first.account_id).toBe(second.account_id);
  });

  it("shares a single request for identical concurrent calls", async () => {
    const { ensureAccount, fetchOrCreateAccount } = await loadModules();
    const api = makeRaceyApi();
    fetchOrCreateAccount.mockImplementation(api.impl);

    const params = { email: "same@user.com", accessToken: "token" };
    const [first, second] = await Promise.all([
      ensureAccount(params),
      ensureAccount(params),
    ]);

    expect(fetchOrCreateAccount).toHaveBeenCalledTimes(1);
    expect(first.account_id).toBe(second.account_id);
  });

  it("resolves the queued call to the account the API resolves for the session", async () => {
    const { ensureAccount, fetchOrCreateAccount } = await loadModules();
    const api = makeRaceyApi();
    fetchOrCreateAccount.mockImplementation(api.impl);

    await ensureAccount({ email: "new@user.com", accessToken: "token" });
    const second = await ensureAccount({
      email: "new@user.com",
      wallet: "0xabc",
      accessToken: "token",
    });

    // The wallet-linking call must resolve to the already-created account.
    expect(second.account_id).toBe("account-1");
    expect(api.rowCount()).toBe(1);
  });

  it("still runs a queued call when the previous call rejects", async () => {
    const { ensureAccount, fetchOrCreateAccount } = await loadModules();
    fetchOrCreateAccount
      .mockRejectedValueOnce(
        new Error("Account API request failed with status: 500"),
      )
      .mockResolvedValueOnce(account("recovered"));

    const failing = ensureAccount({
      email: "a@user.com",
      accessToken: "token",
    });
    const recovering = ensureAccount({
      email: "a@user.com",
      wallet: "0xabc",
      accessToken: "token",
    });

    await expect(failing).rejects.toThrow("500");
    await expect(recovering).resolves.toEqual(account("recovered"));
  });
});
