"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import NeedsYouCard from "./NeedsYouCard";
import ProjectTaskRow from "./ProjectTaskRow";
import type { SplitTasks } from "@/lib/projects/splitProjectTasks";

/** Active and Completed, with the viewer's own items pinned above Active. */
const ProjectTasksTabs = ({ tasks }: { tasks: SplitTasks }) => (
  <Tabs defaultValue="active" className="w-full">
    <TabsList>
      <TabsTrigger value="active">Active</TabsTrigger>
      <TabsTrigger value="completed">Completed</TabsTrigger>
    </TabsList>

    <TabsContent value="active" className="mt-4 flex flex-col gap-1">
      {tasks.needsYou.map((task) => (
        <NeedsYouCard key={task.id} task={task} />
      ))}
      {tasks.active.map((task) => (
        <ProjectTaskRow key={task.id} task={task} />
      ))}
      {!tasks.needsYou.length && !tasks.active.length && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nothing active right now.
        </p>
      )}
    </TabsContent>

    <TabsContent value="completed" className="mt-4 flex flex-col">
      {tasks.completed.map((task) => (
        <ProjectTaskRow key={task.id} task={task} />
      ))}
      {!tasks.completed.length && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nothing completed yet.
        </p>
      )}
    </TabsContent>
  </Tabs>
);

export default ProjectTasksTabs;
