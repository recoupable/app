import type { CollectionComponent } from "../schema";
import type {
  DistributionComponent,
  TimelineComponent,
} from "../representations/schemas";

export type PresentationIntent =
  | { kind: "text" }
  | {
      kind: "representation";
      componentId: string;
      benefit: "show-distribution" | "navigate-time" | "select-records";
    };

export type PresentationDecision =
  | { mode: "visual"; component: CollectionComponent; reason: "select-records" }
  | {
      mode: "text";
      reason:
        | "text-sufficient"
        | "unsupported-intent"
        | "representation-unavailable"
        | "benefit-mismatch"
        | "unsupported-host"
        | "zero-total";
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
  collection?: boolean;
  distribution: boolean;
  timeline: boolean;
};
