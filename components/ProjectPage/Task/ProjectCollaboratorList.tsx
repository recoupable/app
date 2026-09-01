import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { nameInitial } from "@/lib/projects/nameInitial";
import type { ProjectCollaborator } from "@/lib/projects/types";

/** Everyone with access to the project. Names come from the account. */
const ProjectCollaboratorList = ({
  collaborators,
}: {
  collaborators: ProjectCollaborator[];
}) => (
  <div className="flex flex-col gap-2.5">
    {collaborators.map((person) => (
      <div key={person.account_id} className="flex items-center gap-2.5">
        <Avatar className="size-6">
          <AvatarFallback className="text-[11px] font-medium text-muted-foreground">
            {nameInitial(person.name)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">{person.name?.trim() || "Someone"}</span>
      </div>
    ))}
  </div>
);

export default ProjectCollaboratorList;
