export function getSocialProfileHref(profileUrl: string): string {
  const value = profileUrl.trim();
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
