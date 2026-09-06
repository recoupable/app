// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useBillingReads from "@/hooks/useBillingReads";

const settled = (data: unknown) => ({
  data,
  isLoading: false,
  error: null as Error | null,
  isError: false,
});
const reads = {
  paymentMethod: settled({ card: { last4: "4242" } }),
  subscription: settled({ status: "none" }),
  payments: settled({ pages: [{ payments: [] }] }),
  autoTopUp: settled(null),
  balance: settled(12400000),
};

vi.mock("@/hooks/usePaymentMethod", () => ({
  default: () => reads.paymentMethod,
}));
vi.mock("@/hooks/useSubscription", () => ({
  default: () => reads.subscription,
}));
vi.mock("@/hooks/usePayments", () => ({ default: () => reads.payments }));
vi.mock("@/hooks/useAutoTopUp", () => ({ default: () => reads.autoTopUp }));
vi.mock("@/hooks/useAccountBalance", () => ({ default: () => reads.balance }));

describe("useBillingReads", () => {
  const forbidden = () => ({
    data: undefined,
    isLoading: false,
    error: Object.assign(new Error("Failed: 403"), { status: 403 }),
    isError: true,
  });

  beforeEach(() => {
    reads.balance = settled(12400000);
    reads.payments = settled({ pages: [{ payments: [] }] });
    reads.autoTopUp = settled(null);
    reads.subscription = settled({ status: "none" });
  });

  it("is forbidden and not ready when the payments or auto top-up read is a 403", () => {
    reads.payments = forbidden();
    let { result } = renderHook(() => useBillingReads("acct-1"));
    expect(result.current.forbidden).toBe(true);
    expect(result.current.ready).toBe(false);
    reads.payments = settled({ pages: [{ payments: [] }] });
    reads.autoTopUp = forbidden();
    ({ result } = renderHook(() => useBillingReads("acct-1")));
    expect(result.current.forbidden).toBe(true);
    expect(result.current.ready).toBe(false);
  });

  it("is not ready when a refetch turns 403 while cached data remains", () => {
    reads.subscription = { ...forbidden(), data: { status: "active" } };
    const { result } = renderHook(() => useBillingReads("acct-1"));
    expect(result.current.forbidden).toBe(true);
    expect(result.current.ready).toBe(false);
  });

  it("formats the balance as dollars once it has loaded", () => {
    const { result } = renderHook(() => useBillingReads("acct-1"));
    expect(result.current.ready).toBe(true);
    expect(result.current.balanceUsd).toBe("$12.40");
  });

  it("reports no balance rather than $0.00 when the read failed", () => {
    reads.balance = {
      data: undefined,
      isLoading: false,
      error: new Error("x"),
      isError: true,
    };
    const { result } = renderHook(() => useBillingReads("acct-1"));
    expect(result.current.ready).toBe(true);
    expect(result.current.balanceUsd).toBeNull();
  });

  it("drops a cached balance once its refetch fails", () => {
    reads.balance = {
      data: 12400000,
      isLoading: false,
      error: new Error("x"),
      isError: true,
    };
    const { result } = renderHook(() => useBillingReads("acct-1"));
    expect(result.current.balanceUsd).toBeNull();
  });

  it("is ready while the balance is still loading: the balance never gates the page", () => {
    reads.balance = {
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
    };
    const { result } = renderHook(() => useBillingReads("acct-1"));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.ready).toBe(true);
    expect(result.current.balanceUsd).toBeNull();
  });
});
