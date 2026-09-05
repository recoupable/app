// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SideMenu from "@/components/SideMenu/SideMenu";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/" }));
vi.mock("@/providers/UserProvder", () => ({ useUserProvider: () => ({ address: "0xabc", isPrepared: () => true }) }));
vi.mock("@/providers/ArtistProvider", () => ({ useArtistProvider: () => ({ selectedArtist: null, sorted: [], toggleCreation: vi.fn() }) }));
vi.mock("@/components/SideModal", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/Sidebar/RecentChats", () => ({ default: () => null }));
vi.mock("@/components/Sidebar/UnlockPro", () => ({ default: () => null }));
vi.mock("@/components/Sidebar/UserInfo", () => ({ default: () => null }));
vi.mock("@/components/Logo", () => ({ default: () => null }));
vi.mock("@/components/Agents/useAgentData", () => ({ useAgentData: () => ({ agents: [], isLoading: false }) }));

describe("SideMenu", () => {
  it("lists Billing among the tools and navigates to /billing", () => {
    const toggleModal = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SideMenu isVisible toggleModal={toggleModal} />
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "View billing" }));
    expect(push).toHaveBeenCalledWith("/billing");
    expect(toggleModal).toHaveBeenCalled();
  });
});
