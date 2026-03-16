"use client";

import CopyIconButton from "@/components/ui/copy-icon-button";

interface AccountIdDisplayProps {
  accountId: string;
  label?: string;
}

const AccountIdDisplay = ({
  accountId,
  label = "Artist ID",
}: AccountIdDisplayProps) => {
  const truncatedId =
    accountId.length > 12
      ? `${accountId.slice(0, 6)}...${accountId.slice(-6)}`
      : accountId;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-accent transition-colors">
        <span className="text-xs text-muted-foreground font-mono">
          {truncatedId}
        </span>
        <CopyIconButton value={accountId} size="w-3 h-3" />
      </div>
    </div>
  );
};

export default AccountIdDisplay;
