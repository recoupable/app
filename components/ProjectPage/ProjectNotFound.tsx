import { XCircle } from "lucide-react";

/**
 * What a signed-in account sees for a project it cannot reach.
 *
 * The API answers 404 for both an unknown id and a caller who is not a
 * collaborator, and this copy keeps that ambiguity: telling someone a project
 * exists but is not theirs is how a project id gets confirmed.
 */
const ProjectNotFound = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-6">
    <XCircle className="size-8 text-muted-foreground" />
    <p className="mt-3 text-sm text-muted-foreground" role="status">
      {message}
    </p>
  </div>
);

export default ProjectNotFound;
