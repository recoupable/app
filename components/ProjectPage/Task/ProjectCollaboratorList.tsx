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
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
          {person.name?.trim()?.[0]?.toUpperCase() ?? "·"}
        </span>
        <span className="text-sm">{person.name?.trim() || "Someone"}</span>
      </div>
    ))}
  </div>
);

export default ProjectCollaboratorList;
