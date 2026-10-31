import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, vi } from "vitest";

export function forbidTaskNetwork(): void {
  const denyNetwork = vi.fn(() => {
    throw new Error("Task caller tests forbid network");
  });
  beforeEach(() => {
    denyNetwork.mockClear();
    for (const name of ["fetch", "XMLHttpRequest", "WebSocket"]) {
      vi.stubGlobal(name, denyNetwork);
    }
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    expect(denyNetwork).not.toHaveBeenCalled();
  });
}
