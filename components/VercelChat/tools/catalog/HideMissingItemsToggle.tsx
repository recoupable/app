"use client";

import { useId } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

interface HideMissingItemsToggleProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

export default function HideMissingItemsToggle({
  checked,
  onCheckedChange,
}: HideMissingItemsToggleProps) {
  const toggleId = useId();
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Filter className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-xs text-muted-foreground">
          {checked ? "Hiding items with missing info" : "Showing all items"}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Label
          htmlFor={toggleId}
          className="cursor-pointer text-xs text-foreground"
        >
          Hide incomplete
        </Label>
        <Switch
          id={toggleId}
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
}
