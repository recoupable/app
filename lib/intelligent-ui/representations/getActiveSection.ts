import type { TimelineComponent } from "./schemas";

export function getActiveSection(
  component: TimelineComponent,
  position: number,
) {
  return (
    component.sections.find(
      (section) => position >= section.start && position < section.end,
    ) ??
    (position === component.durationSeconds
      ? component.sections.find((section) => section.end === position)
      : undefined)
  );
}
