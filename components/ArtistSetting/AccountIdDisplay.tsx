"use client";

import { Copy, Check } from "lucide-react";
import { useCopy } from "@/hooks/useCopy";

interface AccountIdDisplayProps {
  accountId: string;
  label?: string;
}

const AccountIdDisplay = ({
  accountId,
  label = "Artist ID",
}: AccountIdDisplayProps) => {
  // silent: the tick beside the id is already the confirmation, and these
  // chips appear several to a page — a toast each would be noise.
  const { copied, copy } = useCopy(2000, { silent: true });

  // Truncate account ID for display
  const truncatedId =
    accountId.length > 12
      ? `${accountId.slice(0, 6)}...${accountId.slice(-6)}`
      : accountId;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={() => copy(accountId)}
        className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-accent transition-colors"
      >
        <span className="text-xs text-muted-foreground font-mono">{truncatedId}</span>
        {copied ? (
          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
    </div>
  );
};

export default AccountIdDisplay;
