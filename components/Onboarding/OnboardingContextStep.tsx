"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  name: string | undefined;
  companyName: string | undefined;
  onChangeName: (v: string) => void;
  onChangeCompany: (v: string) => void;
  onNext: () => void;
}

export function OnboardingContextStep({
  name,
  companyName,
  onChangeName,
  onChangeCompany,
  onNext,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Let's get to know you
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Just the basics — we'll do the heavy lifting.
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
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="onb-company">Company / Management firm</Label>
          <Input
            id="onb-company"
            placeholder="e.g. Moonrise Management"
            value={companyName ?? ""}
            onChange={e => onChangeCompany(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={onNext} className="w-full">
        Almost there →
      </Button>
    </div>
  );
}
