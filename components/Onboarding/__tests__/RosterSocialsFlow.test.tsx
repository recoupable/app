// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RosterSocialsFlow from "@/components/Onboarding/RosterSocialsFlow";

const { replace, onboarding } = vi.hoisted(() => ({
  replace: vi.fn(),
  onboarding: { isReady: true, step: "complete", emptyOrganization: false },
}));

vi.mock("@/hooks/useEmptyOrganization", () => ({
  useEmptyOrganization: () => onboarding.emptyOrganization,
}));

vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ isInitialized: true }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/hooks/useOnboardingState", () => ({
  useOnboardingState: () => onboarding,
}));
vi.mock("../ConfirmRosterStep", () => ({
  default: ({ onConfirmed }: { onConfirmed: () => void }) => (
    <button onClick={onConfirmed}>Confirm roster</button>
  ),
}));
vi.mock("../VerifySocialsStep", () => ({
  default: ({ onConfirmed }: { onConfirmed: () => void }) => (
    <button onClick={onConfirmed}>Continue setup</button>
  ),
}));
vi.mock("../SetupSkipLink", () => ({ default: () => null }));

afterEach(cleanup);
beforeEach(() => {
  replace.mockClear();
  onboarding.isReady = true;
  onboarding.emptyOrganization = false;
  onboarding.step = "complete";
});

describe("RosterSocialsFlow", () => {
  it.each(["roster", "socials"] as const)(
    "opens Home for an empty organization on %s",
    (initialStep) => {
      onboarding.emptyOrganization = true;
      render(<RosterSocialsFlow initialStep={initialStep} />);
      expect(replace).toHaveBeenCalledWith("/");
      expect(screen.queryByRole("button")).toBeNull();
    },
  );

  it.each([
    ["catalog", "/setup/catalog"],
    ["task", "/setup/tasks"],
    ["complete", "/"],
  ])("continues directly to %s without a confirmation screen", (step, path) => {
    onboarding.step = step;
    render(<RosterSocialsFlow initialStep="socials" />);
    expect(replace).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Continue setup" }));

    expect(replace).toHaveBeenCalledWith(path);
    expect(screen.queryByText("Artist profiles reviewed")).toBeNull();
    expect(screen.queryByRole("link", { name: "Open chat" })).toBeNull();
  });

  it("waits for checkpoint data before choosing the destination", () => {
    onboarding.isReady = false;
    const { rerender } = render(<RosterSocialsFlow initialStep="socials" />);
    fireEvent.click(screen.getByRole("button", { name: "Continue setup" }));
    expect(replace).not.toHaveBeenCalled();

    onboarding.isReady = true;
    onboarding.step = "task";
    rerender(<RosterSocialsFlow initialStep="socials" />);
    expect(replace).toHaveBeenCalledWith("/setup/tasks");
  });

  it("keeps profile review between roster confirmation and navigation", () => {
    render(<RosterSocialsFlow />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm roster" }));
    expect(replace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Continue setup" }));
    expect(replace).toHaveBeenCalledWith("/");
  });
});
