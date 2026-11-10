"use client";
import type { CreativeAsset } from "@/lib/intelligent-ui/playground/creative/types";
import CreativeComparisonView from "./CreativeComparisonView";

export default function CreativeComparison(props: {
  scope: string;
  assets: CreativeAsset[];
}) {
  return <CreativeComparisonView key={props.scope} {...props} />;
}
