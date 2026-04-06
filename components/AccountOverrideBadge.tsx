"use client";

import { X } from "lucide-react";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";

/**
 * Displays a pill badge when an account override is active.
 * Reads from AccountOverrideProvider context.
 */
export default function AccountOverrideBadge() {
  const { email, accountIdOverride, clear } = useAccountOverride();

  if (!accountIdOverride || !email) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-500 dark:bg-amber-400 text-black px-4 py-2 rounded-full shadow-lg text-sm font-medium">
      <span>Viewing as</span>
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
