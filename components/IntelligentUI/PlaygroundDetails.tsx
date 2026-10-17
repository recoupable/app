"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Surface } from "@/lib/intelligent-ui/schema";
import { getAnswerText } from "@/lib/intelligent-ui/presentation/getAnswerText";

const labels = {
  ready: "Completed fixture shown",
  streaming: "Replaying updates. The current answer stays in place.",
  complete: "Replay complete",
  stopped: "Replay stopped. The current answer is unchanged.",
  error: "Replay interrupted. The current answer is unchanged.",
};

export default function PlaygroundDetails({
  surface,
  streamedSurface,
  status,
  error,
  replay,
  stop,
}: {
  surface: Surface;
  streamedSurface: Surface;
  status: keyof typeof labels;
  error: string | null;
  replay: () => void;
  stop: () => void;
}) {
  return (
    <details className="mt-12 text-xs text-muted-foreground sm:mt-16">
      <summary className="w-fit cursor-pointer rounded-lg py-3 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
        About this example
      </summary>
      <div className="mt-3 space-y-5 leading-6">
        <p>
          This is a design prototype using fictional records and authored
          answers. Response parts combine ordinary Markdown, a static
          distribution, or a linked section timeline and native audio player.
          The audio is an original synthesized study; its section notes were
          authored with it. No model analyzed a recording. Playback position
          stays on this device.
        </p>
        <p>
          Replaying tests the update protocol, not AI generation. Incoming
          revisions are inspected below; text and visual data share a revision,
          and the conversation adopts a new response only when the entire stream
          validates. The concentration insight is calculated from those data.
          Replaying the same timeline preserves position and never starts
          playback.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="min-h-11 text-xs"
            onClick={status === "streaming" ? stop : replay}
          >
            {status === "streaming" ? (
              <Pause aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
            {status === "streaming" ? "Stop replay" : "Replay updates"}
          </Button>
          <p role="status">{labels[status]}</p>
        </div>
        {error && <p role="alert">{error}</p>}
        <details>
          <summary className="w-fit cursor-pointer rounded-lg py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Plain-text data
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
            {getAnswerText(surface)}
          </p>
        </details>
        <details>
          <summary className="w-fit cursor-pointer rounded-lg py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Protocol and answer data
          </summary>
          <pre
            role="region"
            aria-label="Surface JSON"
            tabIndex={0}
            className="mt-3 max-h-96 overflow-auto rounded-xl bg-muted/50 p-4 text-[11px] leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {JSON.stringify(
              {
                answer: surface.answer,
                streamRevision: streamedSurface.revision,
                streamedSurface,
              },
              null,
              2,
            )}
          </pre>
        </details>
        <a
          href="https://github.com/recoupable/app/issues/2197"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-md text-brand-link underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Intelligent UI epic
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </details>
  );
}
