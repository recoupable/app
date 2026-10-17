/** Keep the fixture-only provider exemption narrower than the labs namespace. */
export function isPlaygroundRoute(pathname: string | null): boolean {
  return pathname === "/labs/intelligent-ui";
}
