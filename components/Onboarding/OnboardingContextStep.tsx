"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserProvider } from "@/providers/UserProvder";

interface Props {
  name: string | undefined;
  companyName: string | undefined;
  roleType: string | undefined;
  onChangeName: (v: string) => void;
  onChangeCompany: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const ROLE_COMPANY_LABEL: Record<string, string> = {
  artist_manager: "Management company",
  label: "Label name",
  artist: "Your artist name or team",
  publisher: "Publishing company",
  dsp: "Company / Platform",
  other: "Company or organization",
};

/**
 * Context step — pre-fills name from Privy, adapts company label to role.
 */
export function OnboardingContextStep({
  name,
  companyName,
  roleType,
  onChangeName,
  onChangeCompany,
  onNext,
  onBack,
}: Props) {
  const { userData, email } = useUserProvider();

  // Pre-fill name from account data or email
  useEffect(() => {
    if (!name && (userData?.name || email)) {
      const inferred =
        userData?.name ||
        (email
          ? email
              .split("@")[0]
              .replace(/[._]/g, " ")
              .replace(/\b\w/g, c => c.toUpperCase())
          : "");
      if (inferred) onChangeName(inferred);
    }
  }, [userData?.name, email]); // eslint-disable-line react-hooks/exhaustive-deps

  const companyLabel = ROLE_COMPANY_LABEL[roleType ?? ""] ?? "Company";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quick intro</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll use this to personalize your workspace.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="onb-name">Your name</Label>
          <Input
            id="onb-name"
            placeholder="e.g. Jordan Lee"
            value={name ?? ""}
            onChange={e => onChangeName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && name?.trim() && onNext()}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="onb-company">{companyLabel}</Label>
          <Input
            id="onb-company"
            placeholder="e.g. Moonrise Management"
            value={companyName ?? ""}
            onChange={e => onChangeCompany(e.target.value)}
            onKeyDown={e => e.key === "Enter" && name?.trim() && onNext()}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="w-24">
          ← Back
        </Button>
        <Button onClick={onNext} disabled={!name?.trim()} className="flex-1">
          Continue →
        </Button>
      </div>
    </div>
  );
}
