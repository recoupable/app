"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProjectComment } from "@/hooks/useCreateProjectComment";
import { COMMENT_MAX_LENGTH } from "@/lib/projects/createProjectComment";

/** Post a comment. Append-only: there is no edit and no delete. */
const ProjectCommentComposer = ({
  projectId,
  taskId,
}: {
  projectId: string;
  taskId: string;
}) => {
  const [body, setBody] = useState("");
  const { mutate, isPending } = useCreateProjectComment(projectId, taskId);
  const canPost = body.trim().length > 0 && !isPending;

  const post = () => {
    if (!canPost) return;
    mutate(body.trim(), { onSuccess: () => setBody("") });
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-lg p-3.5 shadow-[0px_0px_0px_1px_var(--border)]">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={COMMENT_MAX_LENGTH}
        placeholder="Write a comment"
        className="min-h-[64px] resize-y border-0 p-0 shadow-none focus-visible:ring-0"
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={post} disabled={!canPost}>
          {isPending ? "Posting…" : "Post"}
        </Button>
      </div>
    </div>
  );
};

export default ProjectCommentComposer;
