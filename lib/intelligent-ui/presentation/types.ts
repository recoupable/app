import type {
  DistributionComponent,
  TimelineComponent,
} from "../representations/schemas";

export type PresentationIntent =
  | { kind: "text" }
  | {
      kind: "representation";
      componentId: string;
      benefit: "show-distribution" | "navigate-time";
    };

export type PresentationDecision =
  | {
      mode: "text";
      reason:
        | "text-sufficient"
        | "unsupported-intent"
        | "representation-unavailable"
        | "benefit-mismatch"
        | "unsupported-host";
    }
  | {
      mode: "visual";
      component: DistributionComponent;
      reason: "show-distribution";
    }
  | {
      mode: "visual";
      component: TimelineComponent;
      reason: "navigate-time";
    };

export type RepresentationCapabilities = {
  distribution: boolean;
  timeline: boolean;
};
