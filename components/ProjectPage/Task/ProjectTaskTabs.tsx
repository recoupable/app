"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProjectCommentList from "./ProjectCommentList";
import ProjectCommentComposer from "./ProjectCommentComposer";
import ProjectCollaboratorList from "./ProjectCollaboratorList";
import type { ProjectTaskResponse } from "@/lib/projects/types";

/**
 * Messages / Documents / Collaborators.
 *
 * Documents renders an empty state: the table, storage and download URLs it
 * needs are a separate piece of work, and the tab is here so the shape is
 * visible rather than appearing later out of nowhere.
 */
const ProjectTaskTabs = ({
  projectId,
  data,
}: {
  projectId: string;
  data: ProjectTaskResponse;
}) => (
  <Tabs defaultValue="messages" className="w-full">
    <TabsList>
      <TabsTrigger value="messages">Messages</TabsTrigger>
      <TabsTrigger value="documents">Documents</TabsTrigger>
      <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
    </TabsList>

    <TabsContent value="messages" className="mt-4 flex flex-col gap-4">
      <ProjectCommentList comments={data.comments} />
      <ProjectCommentComposer projectId={projectId} taskId={data.task.id} />
    </TabsContent>

    <TabsContent value="documents" className="mt-4">
      <p className="py-4 text-sm text-muted-foreground">
        No documents on this task yet.
      </p>
    </TabsContent>

    <TabsContent value="collaborators" className="mt-4">
      <ProjectCollaboratorList collaborators={data.collaborators} />
    </TabsContent>
  </Tabs>
);

export default ProjectTaskTabs;
