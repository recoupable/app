import type { SiteSnapshot } from "./schema";
export type SiteBuildProgress = {
  phase: "queued" | "research" | "design" | "assets" | "build" | "review";
  detail: string;
  reviewPass: number;
  reveal?: {
    concept: string;
    assets: SiteSnapshot["assets"];
    preview?: SiteSnapshot;
    refinement?: string;
  };
};
