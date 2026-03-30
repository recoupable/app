import { useRouter } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";
import AgentTags from "./AgentTags";
import AgentCard from "./AgentCard";
import { useAgentData } from "./useAgentData";
import { useAgentToggleFavorite } from "./useAgentToggleFavorite";
import type { Agent } from "./useAgentData";
import CreateAgentButton from "./CreateAgentButton";
import AgentsSkeleton from "./AgentsSkeleton";

const Agents = () => {
  const { push } = useRouter();
  const {
    tags,
    selectedTag,
    setSelectedTag,
    loading,
    showAllTags,
    setShowAllTags,
    gridAgents,
    isPrivate,
    togglePrivate,
  } = useAgentData();
  const { handleToggleFavorite } = useAgentToggleFavorite();

  const handleAgentClick = (agent: Agent) => {
    push(`/chat?q=${encodeURIComponent(agent.prompt)}`);
  };

  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 pb-0 px-6 md:px-12 flex flex-col h-full min-h-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-left font-heading text-3xl font-bold dark:text-white">
          Agents
        </h1>
        <div className="flex items-center gap-4">
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                if (isPrivate) togglePrivate();
              }}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all cursor-pointer",
                !isPrivate
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Public
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isPrivate) togglePrivate();
              }}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all cursor-pointer",
                isPrivate
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Private
            </button>
          </div>
          <CreateAgentButton />
        </div>
      </div>
      <p className="text-lg text-muted-foreground text-left mb-4 font-light font-sans max-w-2xl">
        <span className="sm:hidden">
          Smarter label teams, powered by agents.
        </span>
        <span className="hidden sm:inline">
          Unlock the potential of your roster with intelligent, task-focused
          agents.
        </span>
      </p>
      <div className="container relative flex flex-col h-full w-full flex-1 min-h-0 items-start">
        <AgentTags
          tags={tags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          showAllTags={showAllTags}
          setShowAllTags={setShowAllTags}
        />
        <div className="relative w-full">
          <div className="absolute top-0 w-full h-8 z-30 pointer-events-none bg-gradient-to-b from-background/95 to-transparent"></div>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto pt-4 md:pt-8 pb-8 relative bg-background w-full">
          {loading ? (
            <AgentsSkeleton />
          ) : gridAgents.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No agents found for this tag.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 xl:gap-8 px-1 md:px-2">
              {gridAgents.map((agent) => (
                <div key={agent.title} className="relative">
                  <AgentCard
                    agent={agent}
                    onClick={() => handleAgentClick(agent)}
                    onToggleFavorite={(id, next) => handleToggleFavorite(id, next)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 w-full h-8 z-30 pointer-events-none bg-gradient-to-t from-background/95 to-transparent"></div>
      </div>
    </div>
  );
};

export default Agents;
