import type { ScenarioResult } from "../scenarioTypes";
export const METHOD_VERSION: string;
export const ADAPTER_VERSION: string;
export const REFERENCE_SOURCE_SHA256: string;
export function runScenario(input: unknown): Promise<ScenarioResult>;
