import type { Surface, SurfaceEvent } from "../schema";

export type ScenarioId =
  | "release"
  | "sourcing"
  | "supplier"
  | "listening"
  | "song"
  | "collection";

export type PlaygroundScenario = {
  id: ScenarioId;
  label: string;
  category: string;
  prompt: string;
  initial: Surface;
  events: SurfaceEvent[];
};
