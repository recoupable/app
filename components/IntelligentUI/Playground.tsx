"use client";

import { useState } from "react";
import Link from "next/link";
import LogoIcon from "@/components/Logo/LogoIcon";
import { conversationExamples } from "@/lib/intelligent-ui/playground/conversationExamples";
import { playgroundScenarios } from "@/lib/intelligent-ui/playground/scenarios";
import CreativeComparisonLab from "./CreativeComparisonLab";
import SelectionContinuityLab from "./SelectionContinuityLab";
import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";
import CatalogExplorer from "./CatalogExplorer";
import PlaygroundWorkspace from "./PlaygroundWorkspace";
import PlaygroundThemeToggle from "./PlaygroundThemeToggle";

export default function Playground() {
  const [exampleId, setExampleId] = useState(conversationExamples[0].id);
  const example =
    conversationExamples.find((item) => item.id === exampleId) ??
    conversationExamples[0];
  const scenario = playgroundScenarios.find(
    (item) => item.id === example.scenarioId,
  )!;
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#conversation"
        className="sr-only rounded-xl bg-card p-3 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:ring-2 focus:ring-ring"
      >
        Skip to the conversation
      </a>
      <header className="flex h-16 items-center justify-between gap-4 px-5 shadow-[0_1px_0_var(--border)] sm:px-8">
        <Link
          href="/"
          aria-label="Recoup home"
          className="flex min-h-11 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogoIcon className="size-6" />
          <span className="text-lg font-medium tracking-tight">recoup</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Design lab</span>
          <PlaygroundThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 pt-8 pb-12 sm:px-8 sm:pt-12">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4 sm:mb-14">
          <div>
            <h1 className="text-sm font-medium">Intelligent UI</h1>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              Fictional examples. No live AI or connected actions.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Example
            <select
              value={exampleId}
              onChange={(event) => setExampleId(event.target.value)}
              className="min-h-11 max-w-full cursor-pointer rounded-xl bg-muted/50 px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isChatIntelligentUIEnabled() && (
                <>
                  <option value="creative-comparison">
                    Creative comparison
                  </option>
                  <option value="selection-continuity">
                    Selection continuity
                  </option>
                </>
              )}
              <option value="catalog-explorer">Catalog explorer</option>
              {conversationExamples.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {exampleId === "creative-comparison" && isChatIntelligentUIEnabled() ? (
          <CreativeComparisonLab />
        ) : exampleId === "selection-continuity" &&
          isChatIntelligentUIEnabled() ? (
          <SelectionContinuityLab />
        ) : exampleId === "catalog-explorer" ? (
          <CatalogExplorer />
        ) : (
          <PlaygroundWorkspace
            key={example.id}
            scenario={scenario}
            example={example}
          />
        )}
      </main>
    </div>
  );
}
