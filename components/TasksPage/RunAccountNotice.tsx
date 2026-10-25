interface RunAccountNoticeProps {
  scopeReady: boolean;
  accountId?: string;
  explicit?: boolean;
}

export default function RunAccountNotice({
  scopeReady,
  accountId,
  explicit,
}: RunAccountNoticeProps) {
  if (!scopeReady)
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Sign in and resolve or clear the selected account to view runs.
      </p>
    );
  if (!accountId) return null;
  return (
    <p className="text-sm text-muted-foreground break-all">
      Runs for account {accountId}.
      {explicit &&
        " The account in this link takes precedence over the workspace selection."}
    </p>
  );
}
