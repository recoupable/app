import type { ReleaseCase, ReleaseCaseItem } from "./types";
export interface ReleaseCaseState {
  scope: string;
  items: ReleaseCaseItem[];
  nextId: string | null;
  current: ReleaseCase | null;
  busy: boolean;
  error: string;
  loaded: boolean;
}
export const empty = (scope: string): ReleaseCaseState => ({
  scope,
  items: [],
  nextId: null,
  current: null,
  busy: false,
  error: "",
  loaded: false,
});
