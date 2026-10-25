import React from "react";
import { render } from "@testing-library/react";
import { vi } from "vitest";
import ReleaseCaseDetails from "../ReleaseCaseDetails";
import type { ReleaseCase } from "@/lib/releases/types";
export function renderReleaseCase(current: ReleaseCase) {
  render(
    <ReleaseCaseDetails
      current={current}
      busy={false}
      onReview={vi.fn()}
      onReload={vi.fn()}
    />,
  );
}
