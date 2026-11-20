"use client";
import type { CreativeAsset } from "@/lib/intelligent-ui/playground/creative/types";
import CreativeComparisonView from "./CreativeComparisonView";
import { useCreativeAccess } from "@/lib/intelligent-ui/playground/creative/useCreativeAccess";

export default function CreativeComparison(props: {
  scope: string;
  assets: CreativeAsset[];
}) {
  const assets = useCreativeAccess(props.assets);
  return (
    <CreativeComparisonView
      key={props.scope}
      scope={props.scope}
      assets={assets}
    />
  );
}
