/** The same path without the checkout redirect params, other params kept. */
export function stripCheckoutParams(pathname: string, searchParams: URLSearchParams): string {
  const rest = new URLSearchParams(searchParams);
  rest.delete("checkout");
  rest.delete("session_id");
  const query = rest.toString();
  return query ? `${pathname}?${query}` : pathname;
}
