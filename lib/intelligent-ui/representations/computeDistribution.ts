import type { DistributionComponent } from "./schemas";

/** Pure, stable arithmetic shared by the visual, written insight and fallback. */
export function computeDistribution(
  component: DistributionComponent,
  count = 2,
) {
  const ranked = [...component.items].sort((a, b) => b.value - a.value);
  const total = ranked.reduce((sum, item) => sum + item.value, 0);
  const top = ranked.slice(0, count);
  return {
    ranked,
    total,
    maximum: ranked[0]?.value ?? 0,
    top,
    share:
      total === 0 ? 0 : top.reduce((sum, item) => sum + item.value, 0) / total,
  };
}
