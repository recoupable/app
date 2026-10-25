"use client";

import { X } from "lucide-react";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";

/**
 * Keeps an explicit account selection clearable even when resolution fails.
 * Reads from AccountOverrideProvider context.
 */
export default function AccountOverrideBadge() {
  const { email, accountIdOverride, clear } = useAccountOverride();

  if (!email) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-500 dark:bg-amber-400 text-black px-4 py-2 rounded-full shadow-lg text-sm font-medium">
      <span>{accountIdOverride ? "Viewing as" : "Selected account"}</span>
      <span className="font-bold">{email}</span>
      <button
        onClick={clear}
        className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Clear account override"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
