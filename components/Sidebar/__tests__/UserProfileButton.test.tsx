// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserProfileButton from "@/components/Sidebar/UserProfileButton";

const login = vi.hoisted(() => vi.fn());
const organization = { selectedOrgId: null as string | null };
const privy = { ready: true, authenticated: false };
const user: {
  userData: { name?: string; account_id?: string; image?: string } | null;
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
  useOrganization: () => organization,
}));
vi.mock("@/hooks/useAccountOrganizations", () => ({
  default: () => ({ data: [{
    organization_id: "org_1",
    organization_name: "Example Label",
    organization_image: "/label.png",
  }] }),
}));
vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  AvatarImage: ({ src, alt }: { src?: string; alt: string }) => (
    <span role="img" aria-label={alt} data-src={src} />
  ),
}));
vi.mock("@/components/Sidebar/UserProfileDropdown", () => ({
  default: () => null,
}));

describe("UserProfileButton", () => {
  beforeEach(() => {
    organization.selectedOrgId = null;
    privy.ready = true;
    privy.authenticated = false;
    user.userData = null;
    user.email = undefined;
    user.address = undefined;
    login.mockClear();
  });

  it.each([true, false])("keeps the user identity when switching workspaces (expanded: %s)", (isExpanded) => {
    privy.authenticated = true;
    user.userData = { name: "Ben Smith", image: "/ben.png", account_id: "acc_1" };
    const { rerender } = render(<UserProfileButton isExpanded={isExpanded} />);

    organization.selectedOrgId = "org_1";
    rerender(<UserProfileButton isExpanded={isExpanded} />);

    expect(screen.getByText("Ben Smith")).toBeDefined();
    expect(screen.getByRole("img", { name: "Ben Smith" }).getAttribute("data-src")).toBe("/ben.png");
    expect(screen.getByText("BS")).toBeDefined();
    expect(screen.queryByText("Example Label")).toBeNull();
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
