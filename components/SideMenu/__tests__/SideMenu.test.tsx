// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SideMenu from "@/components/SideMenu/SideMenu";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/",
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ address: "0xabc", isPrepared: () => true }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({
    selectedArtist: null,
    sorted: [],
    toggleCreation: vi.fn(),
  }),
}));
vi.mock("@/components/SideModal", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@/components/Sidebar/RecentChats", () => ({ default: () => null }));
vi.mock("@/components/Sidebar/UnlockPro", () => ({ default: () => null }));
vi.mock("@/components/Sidebar/UserInfo", () => ({ default: () => null }));
vi.mock("@/components/Logo", () => ({ default: () => null }));
vi.mock("@/components/Agents/useAgentData", () => ({
  useAgentData: () => ({ agents: [], isLoading: false }),
}));

describe("SideMenu", () => {
  it("does not list Billing (it lives in the profile dropdown)", () => {
    render(<SideMenu isMenuOpen setIsMenuOpen={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "View billing" })).toBeNull();
  });
});
