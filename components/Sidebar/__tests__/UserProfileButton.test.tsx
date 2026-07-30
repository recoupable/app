// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserProfileButton from "@/components/Sidebar/UserProfileButton";

const privy = { ready: true, authenticated: false };
const user: { userData: { name?: string; account_id?: string } | null; email?: string } =
  { userData: null, email: undefined };

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => privy,
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => user,
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: null }),
}));
vi.mock("@/hooks/useAccountOrganizations", () => ({
  default: () => ({ data: [] }),
}));
vi.mock("@/components/Sidebar/UserProfileDropdown", () => ({
  default: () => null,
}));

describe("UserProfileButton", () => {
  beforeEach(() => {
    privy.ready = true;
    privy.authenticated = false;
    user.userData = null;
    user.email = undefined;
  });

  // chat#1912 row 2 — the defect a referred first-time visitor hit on 2026-07-29.
  it("renders nothing for a signed-out visitor", () => {
    const { container } = render(<UserProfileButton />);

    expect(screen.queryByLabelText(/loading user profile/i)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.innerHTML).toBe("");
  });

  it("shows the skeleton only while an authenticated session is still loading", () => {
    privy.authenticated = true;

    render(<UserProfileButton />);

    expect(screen.getByLabelText(/loading user profile/i)).toBeDefined();
  });

  it("shows the skeleton before Privy resolves", () => {
    privy.ready = false;

    render(<UserProfileButton />);

    expect(screen.getByLabelText(/loading user profile/i)).toBeDefined();
  });

  it("renders the account chip once the session and account have loaded", () => {
    privy.authenticated = true;
    user.userData = { name: "Ben", account_id: "acc_1" };

    render(<UserProfileButton />);

    expect(screen.getByRole("button", { name: /open user menu/i })).toBeDefined();
    expect(screen.queryByLabelText(/loading user profile/i)).toBeNull();
  });
});
