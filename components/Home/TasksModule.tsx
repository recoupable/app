"use client";

import Link from "next/link";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useTaskRuns } from "@/hooks/useTaskRuns";
import { getHomeTasksModuleState } from "@/lib/home/getHomeTasksModuleState";
import HomeRunRow from "./HomeRunRow";
import StarterTaskCard from "./StarterTaskCard";

/**
 * "Your label at work" homepage module: recent task runs (existing
 * GET /api/tasks/runs) or the one-click starter suggestion for fresh
 * accounts (recoupable/chat#1850). Renders nothing while loading or on
 * failure so the homepage never blocks on it.
 */
const TasksModule = () => {
  const { data: runs, isLoading, isError } = useTaskRuns();
  const { selectedArtist } = useArtistProvider();

  const state = getHomeTasksModuleState({
    runs,
    runsFailed: isError,
    isLoading,
    hasArtist: !!selectedArtist?.account_id,
  });

  if (state.view === "hidden") return null;

  return (
    <section
      aria-label="Your label at work"
      className="w-full rounded-xl bg-card p-6 shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.04)] dark:shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.2)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
          Your label at work
        </h2>
        <Link
          href="/tasks"
          className="text-xs font-medium text-foreground hover:underline"
        >
          View all
        </Link>
      </div>
      {state.view === "runs" ? (
        <div className="flex flex-col">
          {state.runs.map((run) => (
            <HomeRunRow key={run.id} run={run} />
          ))}
        </div>
      ) : (
        <StarterTaskCard />
      )}
    </section>
  );
};

export default TasksModule;
