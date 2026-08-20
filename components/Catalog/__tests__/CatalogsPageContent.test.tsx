// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CatalogsPageContent from "@/components/Catalog/CatalogsPageContent";
import type { Catalog } from "@/types/Catalog";

const DUETTI = "5d511b7e-de11-4566-ae90-b5fd5535d900";
const RECOUP = "04e3aba9-c130-4fb8-8b92-34e95d43e66b";
const SWEETS = "fb678396-a68f-4294-ae50-b8cacf9ce77b";

const state = vi.hoisted(() => ({
  selectedOrgId: null as string | null,
  isLoading: false,
  error: null as Error | null,
  catalogsOverride: null as unknown[] | null,
}));

vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: state.selectedOrgId }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: SWEETS } }),
}));
vi.mock("@/hooks/useAccountOrganizations", () => ({
  default: () => ({
    data: [
      { id: "1", organization_id: DUETTI, organization_name: "Duetti" },
      { id: "2", organization_id: RECOUP, organization_name: "Recoup" },
    ],
  }),
}));
vi.mock("@/components/Valuation/RunValuationButton", () => ({
  default: () => <button>Run valuation</button>,
}));
vi.mock("@/components/Catalog/CatalogCard", () => ({
  default: ({ catalog }: { catalog: Catalog }) => <div>{catalog.name}</div>,
}));

const catalog = (name: string, ownerId: string): Catalog => ({
  id: name,
  name,
  created_at: "2026-08-06T04:10:06.974381+00:00",
  updated_at: "2026-08-06T04:10:06.974381+00:00",
  owner: {
    id: ownerId,
    name: null,
    image: null,
    is_organization: ownerId !== SWEETS,
  },
});

const catalogs = [
  catalog("Collie Buddz", SWEETS),
  catalog("Kevin Gates", DUETTI),
];

vi.mock("@/hooks/useCatalogs", () => ({
  default: () => ({
    data: { status: "success", catalogs: state.catalogsOverride ?? catalogs },
    isLoading: state.isLoading,
    error: state.error,
  }),
}));

describe("CatalogsPageContent", () => {
  beforeEach(() => {
    state.selectedOrgId = null;
    state.isLoading = false;
    state.error = null;
    state.catalogsOverride = null;
  });

  it("shows every catalog the account can see on the personal account", () => {
    render(<CatalogsPageContent />);

    expect(screen.getByText("Collie Buddz")).toBeDefined();
    expect(screen.getByText("Kevin Gates")).toBeDefined();
  });

  it("shows only the selected organization's catalogs", () => {
    state.selectedOrgId = DUETTI;

    render(<CatalogsPageContent />);

    expect(screen.getByText("Kevin Gates")).toBeDefined();
    expect(screen.queryByText("Collie Buddz")).toBeNull();
  });

  it("names the organization when it owns no catalogs", () => {
    state.selectedOrgId = RECOUP;

    render(<CatalogsPageContent />);

    expect(screen.getByText("No catalogs in Recoup yet.")).toBeDefined();
    expect(screen.queryByText("Collie Buddz")).toBeNull();
  });

  it("shows everything when the stored selection is an org this account left", () => {
    // selectedOrgId is persisted, so it survives an account switch. Scoping to
    // it would empty the page and name an organization the viewer cannot see.
    state.selectedOrgId = "an-org-from-a-previous-account";

    render(<CatalogsPageContent />);

    expect(screen.getByText("Collie Buddz")).toBeDefined();
    expect(screen.getByText("Kevin Gates")).toBeDefined();
    expect(screen.queryByText(/No catalogs in/)).toBeNull();
  });

  it("renders skeletons while the catalogs are loading, whatever the org", () => {
    state.selectedOrgId = DUETTI;
    state.isLoading = true;

    render(<CatalogsPageContent />);

    expect(screen.queryByText("Kevin Gates")).toBeNull();
    expect(screen.queryByText(/No catalogs/)).toBeNull();
  });

  it("surfaces a load failure instead of an empty organization", () => {
    state.selectedOrgId = DUETTI;
    state.error = new Error("Failed to fetch");

    render(<CatalogsPageContent />);

    expect(screen.getByText("Failed to fetch")).toBeDefined();
    expect(screen.queryByText(/No catalogs in/)).toBeNull();
  });

  // chat#1973: the personal-scope empty state is a primary no-valuation
  // surface — it must carry the one-click run button, and an org-scoped empty
  // view must not (a run always lands the catalog on the calling account).
  it("renders the run button on the personal-scope empty state", () => {
    state.selectedOrgId = null;
    state.catalogsOverride = [];
    render(<CatalogsPageContent />);

    expect(screen.getByText("No catalogs found.")).toBeDefined();
    expect(screen.getByText("Run valuation")).toBeDefined();
  });

  it("does not render the run button on an organization-scoped empty state", () => {
    state.selectedOrgId = DUETTI;
    state.catalogsOverride = [];
    render(<CatalogsPageContent />);

    expect(screen.queryByText("Run valuation")).toBeNull();
  });
});
