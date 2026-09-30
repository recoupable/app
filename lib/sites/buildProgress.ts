export type SiteBuildProgress = {
  phase: "queued" | "research" | "design" | "assets" | "build" | "review";
  detail: string;
  reviewPass: number;
};
