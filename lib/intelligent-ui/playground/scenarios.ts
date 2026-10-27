import { collectionScenario } from "./collectionScenario";
import type { PlaygroundScenario } from "./scenarioTypes";
import { getCompletedExample } from "./getCompletedExample";
import { createSupplierScenario } from "./createSupplierScenario";
import { releaseProtocolScenario } from "./releaseProtocolScenario";
import { sourcingProtocolScenario } from "./sourcingProtocolScenario";
import { listeningScenario } from "./listeningScenario";
import { songScenario } from "./songScenario";

export type { ScenarioId, PlaygroundScenario } from "./scenarioTypes";

export const playgroundScenarios: PlaygroundScenario[] = [
  releaseProtocolScenario,
  sourcingProtocolScenario,
  createSupplierScenario(getCompletedExample(sourcingProtocolScenario)),
  listeningScenario,
  songScenario,
  collectionScenario,
];
