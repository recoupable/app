/** Preserve the run's explicit read target without changing global selection. */
export function getAccountScopedHref(href: string, accountId?: string): string {
  if (accountId === undefined) return href;
  const [path, query] = href.split("?");
  const params = new URLSearchParams(query);
  params.set("account_id", accountId);
  return `${path}?${params}`;
}
