"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ACCOUNT_OVERRIDE_STORAGE_KEY } from "@/lib/consts";

/**
 * Displays a pill badge when an account override is active via ?email= query param.
 * Reads from session storage populated by AccountOverrideSync.
 */
export default function AccountOverrideBadge() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  if (!email || email === "clear") return null;

  const handleClear = () => {
    window.sessionStorage.removeItem(ACCOUNT_OVERRIDE_STORAGE_KEY);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("email");
    const newPath = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    router.replace(newPath);
  };

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-primary/90 text-white px-3 py-1.5 rounded-full shadow-lg text-sm backdrop-blur-sm">
      <span className="opacity-80">Viewing as</span>
      <span className="font-medium">{email}</span>
      <button
        onClick={handleClear}
        className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Clear account override"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
