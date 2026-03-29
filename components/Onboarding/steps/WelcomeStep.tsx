"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useUserProvider } from "@/providers/UserProvder";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";
import { useOrganization } from "@/providers/OrganizationProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function WelcomeStep({ onNext, onBack }: WelcomeStepProps) {
  void onBack; // Unused in welcome step (first step)

  const { setName, name: savedName } = useOnboarding();
  const { userData } = useUserProvider();
  const { data: organizations } = useAccountOrganizations();
  const { selectedOrgId } = useOrganization();

  // Local state for the input field
  const [nameInput, setNameInput] = useState("");

  // Get the org name from selected org or first org
  const selectedOrg = organizations?.find(
    (org) => org.organization_id === selectedOrgId
  );
  const orgName =
    selectedOrg?.organization_name ||
    organizations?.[0]?.organization_name ||
    "your organization";

  // Pre-fill name from onboarding state or user data on mount
  useEffect(() => {
    if (savedName) {
      setNameInput(savedName);
    } else if (userData?.name) {
      setNameInput(userData.name);
    }
  }, [savedName, userData?.name]);

  const handleContinue = () => {
    if (nameInput.trim()) {
      setName(nameInput.trim());
      onNext();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && nameInput.trim()) {
      handleContinue();
    }
  };

  const isDisabled = !nameInput.trim();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">Welcome to Recoup!</h1>
      <p className="text-lg text-muted-foreground mb-8">
        I&apos;m your AI assistant for {orgName}.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <label
          htmlFor="name-input"
          className="text-lg font-medium block text-left"
        >
          What should I call you?
        </label>
        <Input
          id="name-input"
          type="text"
          placeholder="Enter your name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-12 text-base"
          autoFocus
        />
      </div>

      <Button
        onClick={handleContinue}
        disabled={isDisabled}
        className="mt-8 px-8"
        style={{
          backgroundColor: isDisabled ? undefined : "#345A5D",
        }}
      >
        Continue
      </Button>
    </div>
  );
}
