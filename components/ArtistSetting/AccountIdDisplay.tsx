"use client";

import CopyButton from "@/components/CopyButton";

interface AccountIdDisplayProps {
  accountId: string;
  label?: string;
}

/**
 * A truncated account id you can click to copy in full.
 *
 * The whole chip is the click target, id included, which is why the id is
 * passed as `CopyButton`'s children rather than rendered beside it — a bare
 * icon button would shrink the target to the icon alone.
 */
const AccountIdDisplay = ({ accountId, label = "Artist ID" }: AccountIdDisplayProps) => {
  const truncatedId =
    accountId.length > 12 ? `${accountId.slice(0, 6)}...${accountId.slice(-6)}` : accountId;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <CopyButton
        text={accountId}
        label={label}
        variant="ghost"
        silent
        iconClassName="w-3 h-3"
        className="flex h-auto w-auto items-center gap-1 rounded-md px-2 py-0.5 text-muted-foreground hover:bg-accent"
      >
        <span className="font-mono text-xs">{truncatedId}</span>
      </CopyButton>
    </div>
  );
};

export default AccountIdDisplay;
