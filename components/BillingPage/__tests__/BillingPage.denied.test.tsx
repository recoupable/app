// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BillingPage from "@/components/BillingPage/BillingPage";

const scope = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
const reads = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
const mutations = vi.hoisted(() => ({
  configureCard: { mutate: vi.fn(), isPending: false },
  upgrade: vi.fn(),
  manageBilling: vi.fn(),
  removeCard: { mutate: vi.fn(), isPending: false },
  saveAutoTopUp: { mutate: vi.fn(), isPending: false, error: null },
}));

vi.mock("@/hooks/useBillingScope", () => ({ default: () => scope.value }));
vi.mock("@/hooks/useBillingReads", () => ({ default: () => reads.value }));
vi.mock("@/hooks/useAccountBalance", () => ({ default: () => ({ data: 0 }) }));
vi.mock("@/hooks/useBillingMutations", () => ({ default: () => mutations }));
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const forbidden = Object.assign(new Error("Failed: 403"), { status: 403 });

describe("BillingPage access", () => {
  it("shows the denied screen and no panels when a read is forbidden", () => {
    scope.value = {
      accountId: "5d2be75b-b49b-4c2a-ac0a-63d812430dda",
      isOrg: false,
      scopeLabel: "this account",
      forced: true,
      invalid: false,
      switchToPersonal: vi.fn(),
    };
    reads.value = {
      isLoading: false,
      failed: forbidden,
      forbidden: true,
      ready: false,
      card: null,
      rows: [],
      subscription: { error: forbidden },
      payments: {},
      autoTopUp: {},
      autoTopUpSettings: {},
    };
    render(<BillingPage accountId="5d2be75b-b49b-4c2a-ac0a-63d812430dda" />);
    expect(
      screen.getByText(/You do not have access to this account's billing/),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: /Back to your billing/ })
        .getAttribute("href"),
    ).toBe("/billing");
    expect(screen.queryByText("Payment method")).toBeNull();
    expect(screen.queryByText("Payments")).toBeNull();
  });

  it("shows the denied screen for an invalid account id without reading anything", () => {
    scope.value = {
      accountId: undefined,
      isOrg: false,
      scopeLabel: "this account",
      forced: true,
      invalid: true,
      switchToPersonal: vi.fn(),
    };
    reads.value = {
      isLoading: false,
      failed: null,
      forbidden: false,
      ready: false,
      card: null,
      rows: [],
      subscription: {},
      payments: {},
      autoTopUp: {},
      autoTopUpSettings: {},
    };
    render(<BillingPage accountId="nope" />);
    expect(
      screen.getByText(/You do not have access to this account's billing/),
    ).toBeTruthy();
    expect(screen.queryByText("Payment method")).toBeNull();
  });

  it("renders no panels when a refetch turned 403 while cached data remains", () => {
    scope.value = {
      accountId: "5d2be75b-b49b-4c2a-ac0a-63d812430dda",
      isOrg: false,
      isMine: false,
      isResolving: false,
      scopeLabel: "this account",
      forced: true,
      invalid: false,
      switchToPersonal: vi.fn(),
    };
    reads.value = {
      isLoading: false,
      failed: forbidden,
      forbidden: true,
      ready: true,
      card: null,
      balanceUsd: "$1.00",
      subscription: { data: { status: "none" }, error: forbidden },
      payments: { data: { pages: [{ payments: [] }] } },
      autoTopUp: {},
      autoTopUpSettings: {
        enabled: false,
        amountCents: null,
        thresholdCents: null,
      },
    };
    render(<BillingPage accountId="5d2be75b-b49b-4c2a-ac0a-63d812430dda" />);
    expect(screen.getByText(/You do not have access/)).toBeTruthy();
    expect(screen.queryByText("Payment method")).toBeNull();
    expect(screen.queryByRole("button", { name: "Upgrade" })).toBeNull();
  });

  it("offers Upgrade only when the forced account is the viewer's own", () => {
    const ready = {
      isLoading: false,
      failed: null,
      forbidden: false,
      ready: true,
      card: null,
      balanceUsd: "$1.00",
      subscription: { data: { status: "none" } },
      payments: { data: { pages: [{ payments: [] }] } },
      autoTopUp: {},
      autoTopUpSettings: {
        enabled: false,
        amountCents: null,
        thresholdCents: null,
      },
    };
    const forced = {
      accountId: "5d2be75b-b49b-4c2a-ac0a-63d812430dda",
      isOrg: false,
      isResolving: false,
      scopeLabel: "this account",
      forced: true,
      invalid: false,
      switchToPersonal: vi.fn(),
    };
    scope.value = { ...forced, isMine: false };
    reads.value = ready;
    const { unmount } = render(
      <BillingPage accountId="5d2be75b-b49b-4c2a-ac0a-63d812430dda" />,
    );
    expect(screen.queryByRole("button", { name: "Upgrade" })).toBeNull();
    unmount();
    scope.value = { ...forced, isMine: true, scopeLabel: "your account" };
    render(<BillingPage accountId="5d2be75b-b49b-4c2a-ac0a-63d812430dda" />);
    expect(screen.getByRole("button", { name: "Upgrade" })).toBeTruthy();
  });
});
