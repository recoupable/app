import type { ReleaseCaseState } from "./state";

export const createReleaseCaseState = (scope: string): ReleaseCaseState => ({
  scope,
  items: [],
  nextId: null,
  current: null,
  busy: false,
  error: "",
  loaded: false,
});
