import type { TimelineComponent } from "./schemas";

/** A cache identity, not an authorization token. Changed interval meanings reset it. */
export function getTimelineStateKey(
  component: TimelineComponent,
  scope: string,
): string {
  const input = JSON.stringify(component);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index++)
    hash = Math.imul(hash ^ input.charCodeAt(index), 16777619);
  return `recoup:iui:timeline-v1:${scope}:${component.id}:${(hash >>> 0).toString(16)}`;
}
