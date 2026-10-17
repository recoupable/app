/** The host resolves known asset identities; generated data never supplies a URL. */
export function resolvePlaygroundAsset(assetId: string): string | undefined {
  return assetId === "section-study-v1"
    ? "/api/intelligent-ui/playground/audio"
    : undefined;
}
