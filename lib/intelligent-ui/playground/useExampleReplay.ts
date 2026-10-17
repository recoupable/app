"use client";

import { useEffect, useRef, useState } from "react";
import { applySurfaceEvent } from "../applySurfaceEvent";
import { parseSurfaceStream } from "../parseSurfaceStream";
import type { Surface } from "../schema";
import type { PlaygroundScenario } from "./scenarios";

export function useExampleReplay(scenario: PlaygroundScenario) {
  const [surface, setSurface] = useState(scenario.initial);
  const [completedSurface, setCompletedSurface] = useState<Surface | null>(
    null,
  );
  const [status, setStatus] = useState<
    "ready" | "streaming" | "complete" | "stopped" | "error"
  >("ready");
  const [error, setError] = useState<string | null>(null);
  const active = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      active.current?.abort();
      active.current = null;
    },
    [],
  );

  const stop = () => {
    active.current?.abort();
    active.current = null;
    setStatus("stopped");
  };

  const replay = async () => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setError(null);
    setStatus("streaming");
    let current: Surface | null = null;
    let complete = false;
    try {
      const response = await fetch(
        `/api/intelligent-ui/playground?scenario=${scenario.id}`,
        { signal: controller.signal, cache: "no-store" },
      );
      if (!response.ok || !response.body)
        throw new Error("The example stream is unavailable. Try replaying it.");
      for await (const event of parseSurfaceStream(response.body, {
        signal: controller.signal,
      })) {
        if (active.current !== controller) return;
        if (complete)
          throw new Error("The example sent data after completion.");
        if (
          event.type === "surface.snapshot" &&
          (event.surface.id !== scenario.initial.id ||
            event.surface.context.workspaceId !==
              scenario.initial.context.workspaceId ||
            event.surface.context.subject.id !==
              scenario.initial.context.subject.id ||
            event.surface.context.subject.kind !==
              scenario.initial.context.subject.kind)
        ) {
          throw new Error(
            "The example belongs to a different workspace or subject.",
          );
        }
        current = applySurfaceEvent(current, event);
        setSurface(current);
        complete = event.type === "surface.complete";
      }
      if (!complete)
        throw new Error(
          "The stream ended early. The last valid view is still available; replay to finish.",
        );
      if (active.current === controller) {
        // Commit only after a valid completion and EOF. A malformed refresh must
        // not replace the coherent answer the user is already reading/editing.
        setCompletedSurface(current);
        setStatus("complete");
      }
    } catch (cause) {
      if (controller.signal.aborted || active.current !== controller) return;
      setError(
        cause instanceof Error && cause.message.startsWith("The ")
          ? cause.message
          : "An update could not be validated. The last valid view is still available; replay to try again.",
      );
      setStatus("error");
    } finally {
      if (active.current === controller) active.current = null;
    }
  };

  return { surface, completedSurface, status, error, replay, stop };
}
