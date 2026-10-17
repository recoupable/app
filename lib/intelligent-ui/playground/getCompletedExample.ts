import { applySurfaceEvent } from "../applySurfaceEvent";
import type { Surface } from "../schema";
import type { PlaygroundScenario } from "./scenarios";

/** A validated, completed fixture lets the design lab open at the actual answer. */
export function getCompletedExample(scenario: PlaygroundScenario): Surface {
  let surface: Surface | null = null;
  let complete = false;
  for (const event of scenario.events) {
    if (complete) throw new Error("Example contains events after completion.");
    surface = applySurfaceEvent(surface, event);
    complete = event.type === "surface.complete";
  }
  if (!surface || !complete) throw new Error("Example is incomplete.");
  return surface;
}
