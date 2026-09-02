import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatTaskDate } from "@/lib/projects/formatTaskDate";
import { nameInitial } from "@/lib/projects/nameInitial";
import type { ProjectComment } from "@/lib/projects/types";

/**
 * The comment feed, oldest first so it reads top to bottom.
 *
 * `author_name` is null for most accounts today — nothing captures a name at
 * sign-up — so the name falls back to "Someone" rather than rendering blank.
 */
const ProjectCommentList = ({ comments }: { comments: ProjectComment[] }) => {
  if (!comments.length) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No comments yet. Anything you write here reaches us.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex flex-col gap-1.5 rounded-lg p-3.5 shadow-[0px_0px_0px_1px_var(--border)]"
        >
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="text-[11px] font-medium text-muted-foreground">
                {nameInitial(comment.author_name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-[13px] font-medium">
              {comment.author_name?.trim() || "Someone"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTaskDate(comment.created_at)}
            </span>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {comment.body}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ProjectCommentList;
