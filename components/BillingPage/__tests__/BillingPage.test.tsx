// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BillingPage from "@/components/BillingPage/BillingPage";

const scope = {
  accountId: "acct-1" as string | undefined,
  isOrg: false,
  isResolving: false,
  scopeLabel: "your account",
  switchToPersonal: vi.fn(),
};
const settled = (data: unknown) => ({
  data,
  isLoading: false,
  error: null,
  isError: false,
});
const reads = {
  subscription: settled({ status: "none" }),
  payments: settled({ pages: [{ payments: [] }] }),
  autoTopUp: settled(null),
  autoTopUpSettings: {
    account_id: "acct-1",
    enabled: false,
    amountCents: null,
    thresholdCents: null,
    lastRunAt: null,
    lastError: null,
  },
  isLoading: false,
  failed: null,
  ready: true,
  card: {
    brand: "visa",
    last4: "4242",
    exp_month: 12,
    exp_year: 2027,
    funding: "credit",
  },
  rows: [],
  balanceUsd: "$12.40" as string | null,
};
const mutation = { mutate: vi.fn(), isPending: false, error: null };

vi.mock("@/hooks/useBillingScope", () => ({ default: () => scope }));
vi.mock("@/hooks/useBillingReads", () => ({ default: () => reads }));
vi.mock("@/hooks/useBillingMutations", () => ({
  default: () => ({
    configureCard: { mutate: vi.fn(), isPending: false },
    upgrade: vi.fn(),
    manageBilling: vi.fn(),
    removeCard: mutation,
    saveAutoTopUp: mutation,
  }),
}));

describe("BillingPage", () => {
  beforeEach(() => {
    scope.accountId = "acct-1";
    scope.isResolving = false;
    reads.ready = true;
  });

  it("shows the balance from the reads in the auto top-up panel", () => {
    render(<BillingPage />);
    expect(screen.getByText(/Current balance \$12\.40\./)).toBeTruthy();
  });

  it("shows the skeleton, not personal billing, while the org scope is resolving", () => {
    scope.accountId = undefined;
    scope.isResolving = true;
    reads.ready = false;
    const { container } = render(<BillingPage />);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByText(/Current balance/)).toBeNull();
  });
});
