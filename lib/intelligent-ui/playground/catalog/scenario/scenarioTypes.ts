import vectors from "./vendor/scenario-vectors.json";

export type ScenarioRequest = Omit<typeof vectors.request, "spotify_rate"> & {
  spotify_rate: number | null;
};
type Bands = {
  low: number | null;
  central: number | null;
  high: number | null;
};
export interface ScenarioModel {
  status: string;
  scope: string;
  currency: string;
  covered_tracks: number;
  input_tracks: number;
  coverage_share: number;
  population_complete: boolean;
  unknown_track_ids: string[];
  annual_gross: Bands;
  annual_nls: Bands;
  value: Bands;
  limitations: string[];
}
export interface ScenarioResult {
  method_version: string;
  calculation_schema: string;
  calculation_source_sha256: string;
  execution_runtime: string;
  calculation_source_role: string;
  observations: ScenarioRequest["observations"];
  observations_sha256: string;
  baseline_assumptions: ScenarioRequest["assumptions"];
  scenario_assumptions: ScenarioRequest["assumptions"];
  baseline: ScenarioModel;
  scenario: ScenarioModel;
  reset_to_baseline: boolean;
  output_basis: string;
  units: Record<string, string>;
  numeric_policy: string;
}
