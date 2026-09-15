// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AddCatalogButton from "../AddCatalogButton";
const mocks = vi.hoisted(() => ({
  memberships: [{ organization_id: "org" }],
  create: vi.fn(),
  push: vi.fn(),
  invalidate: vi.fn(),
}));
vi.mock("@/hooks/useAccountOrganizations", () => ({
  default: () => ({ isSuccess: true, data: mocks.memberships }),
}));
vi.mock("@/lib/catalog/createCatalog", () => ({ createCatalog: mocks.create }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ getAccessToken: async () => "token" }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidate }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: "org", isInitialized: true }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "account" } }),
}));
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.memberships = [{ organization_id: "org" }];
});
describe("AddCatalogButton", () => {
  it("uses the Personal fallback after organization membership is revoked", async () => {
    mocks.memberships = [];
    mocks.create.mockResolvedValue("catalog");
    render(<AddCatalogButton />);
    fireEvent.click(screen.getByRole("button", { name: "Add catalog" }));
    fireEvent.change(screen.getByLabelText("Catalog name"), {
      target: { value: "Personal catalog" },
    });
    fireEvent.submit(screen.getByLabelText("Catalog name").closest("form")!);
    await waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith(
        "Personal catalog",
        "token",
        null,
      ),
    );
  });

  it("creates in the selected organization and opens song management", async () => {
    mocks.create.mockResolvedValue("catalog");
    render(<AddCatalogButton />);
    fireEvent.click(screen.getByRole("button", { name: "Add catalog" }));
    fireEvent.change(screen.getByLabelText("Catalog name"), {
      target: { value: "New catalog" },
    });
    fireEvent.submit(screen.getByLabelText("Catalog name").closest("form")!);
    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith("/catalogs/catalog?tab=songs"),
    );
    expect(mocks.create).toHaveBeenCalledWith("New catalog", "token", "org");
    expect(mocks.invalidate).toHaveBeenCalledWith({
      queryKey: ["catalogs", "account"],
    });
  });
  it("keeps the entered name and shows an error when saving fails", async () => {
    mocks.create.mockRejectedValue(new Error("Please retry"));
    render(<AddCatalogButton />);
    fireEvent.click(screen.getByRole("button", { name: "Add catalog" }));
    fireEvent.change(screen.getByLabelText("Catalog name"), {
      target: { value: "Keep this" },
    });
    fireEvent.submit(screen.getByLabelText("Catalog name").closest("form")!);
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Please retry",
    );
    expect(screen.getByLabelText("Catalog name")).toHaveProperty(
      "value",
      "Keep this",
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
