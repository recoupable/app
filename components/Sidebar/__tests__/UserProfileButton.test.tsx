// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserProfileButton from "@/components/Sidebar/UserProfileButton";

const login = vi.hoisted(() => vi.fn());
const privy = { ready: true, authenticated: false };
const user: {
  userData: { name?: string; account_id?: string } | null;
  email?: string;
  address?: string;
  login: () => void;
} = { userData: null, email: undefined, address: undefined, login };

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
    user.address = undefined;
    login.mockClear();
  });

  // chat#1912 row 2 — the defect a referred first-time visitor hit on 2026-07-29:
  // a profile skeleton that could never resolve, pinned under a Sign In button.
  it("offers a sign-in button to a signed-out visitor, never a skeleton", () => {
    render(<UserProfileButton />);

    expect(screen.queryByLabelText(/loading user profile/i)).toBeNull();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
  });

  it("opens the login prompt when the signed-out slot is clicked", () => {
    render(<UserProfileButton />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(login).toHaveBeenCalled();
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
