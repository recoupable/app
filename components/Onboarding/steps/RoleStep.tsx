"use client";

import { useState, useEffect } from "react";
import { useOnboarding, UserRole } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";

interface RoleStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "manager",
    label: "Manager",
    description: "Artist management and day-to-day operations",
  },
  {
    value: "label",
    label: "Label / A&R",
    description: "Label operations and artist development",
  },
  {
    value: "marketing",
    label: "Marketing",
    description: "Campaigns, social media, and growth",
  },
  {
    value: "pr",
    label: "PR / Publicist",
    description: "Press relations and media outreach",
  },
  {
    value: "artist",
    label: "Artist",
    description: "Creating and releasing music",
  },
  {
    value: "other",
    label: "Other",
    description: "Another role in the music industry",
  },
];

export default function RoleStep({ onNext, onBack }: RoleStepProps) {
  const { setRole, role: savedRole, name } = useOnboarding();

  // Local state for selected role
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  // Pre-fill from saved state on mount
  useEffect(() => {
    if (savedRole) {
      setSelectedRole(savedRole);
    }
  }, [savedRole]);

  const handleContinue = () => {
    if (selectedRole) {
      setRole(selectedRole);
      onNext();
    }
  };

  const isDisabled = !selectedRole;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">
        Nice to meet you, {name || "there"}!
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        What&apos;s your role?
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-8">
        {ROLE_OPTIONS.map((option) => {
          const isSelected = selectedRole === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedRole(option.value)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? "border-[#345A5D] bg-[#345A5D]/10"
                    : "border-input hover:border-[#345A5D]/50"
                }
              `}
              style={{
                borderColor: isSelected ? "#345A5D" : undefined,
              }}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {option.description}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={isDisabled}
          className="px-8"
          style={{
            backgroundColor: isDisabled ? undefined : "#345A5D",
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
