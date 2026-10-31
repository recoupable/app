import type { Representation } from "./schemas";
import { computeDistribution } from "./computeDistribution";
import { formatDistributionNumber } from "./formatDistributionNumber";
import { formatTime } from "./formatTime";

export function getRepresentationText(component: Representation): string {
  if (component.type === "timeline")
    return `${component.title} (${formatTime(component.durationSeconds)})\n${component.sections.map((section) => `${formatTime(section.start)}–${formatTime(section.end)} · ${section.label}: ${section.description}`).join("\n")}`;
  const { ranked, total } = computeDistribution(component);
  return `${component.title}\n${component.measure.label} · ${component.measure.periodStart} to ${component.measure.periodEnd}\n${component.measure.population}. ${component.complete ? "Complete supplied selection" : `Partial selection: ${component.items.length} of ${component.totalCount} records`}.\n${ranked.map((item) => `${item.label}: ${formatDistributionNumber(item.value)} ${component.measure.unit}`).join("\n")}\nTotal supplied: ${formatDistributionNumber(total)} ${component.measure.unit}.`;
}
