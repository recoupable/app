"use client";
import { useState } from "react";
import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";
import { createReleasePlanFixture } from "@/lib/intelligent-ui/playground/release-plan/createReleasePlanFixture";
import { getReleasePlanKey } from "@/lib/intelligent-ui/playground/release-plan/getReleasePlanKey";
import ReleasePlanEditor from "./ReleasePlanEditor";

export default function ReleasePlanLab() {
  const [fixture] = useState(createReleasePlanFixture);
  if (!isChatIntelligentUIEnabled()) return null;
  return (
    <ReleasePlanEditor
      key={getReleasePlanKey(fixture.scope)}
      fixture={fixture}
    />
  );
}
