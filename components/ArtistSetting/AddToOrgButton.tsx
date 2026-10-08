"use client";

import { Building2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonPatterns } from "@/lib/styles/patterns";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";
import useAddArtistToOrganization from "@/hooks/useAddArtistToOrganization";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface AddToOrgButtonProps {
  artistId: string;
}

const AddToOrgButton = ({ artistId }: AddToOrgButtonProps) => {
  const {
    data: organizations = [],
    isPending,
    isError,
    refetch,
  } = useAccountOrganizations();
  const { addArtistToOrganization, isAdding, error, addedToOrgId } =
    useAddArtistToOrganization();
  const addedOrg = organizations.find(
    (org) => org.organization_id === addedToOrgId,
  );

  return (
    <div className="col-span-12 space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isAdding || isPending || isError || !organizations.length}
          className={cn(
            buttonPatterns.secondary,
            "w-full min-h-11 py-2 flex items-center justify-center gap-2",
          )}
        >
          <Building2 className="size-4" />
          {isAdding ? "Adding…" : "Add to Organization"}
          <ChevronDown className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.organization_id}
              onSelect={() => {
                void addArtistToOrganization(artistId, org.organization_id);
              }}
            >
              {org.organization_name || "Organization"}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {addedOrg && (
        <p role="status" className="text-sm text-muted-foreground">
          Artist is on {addedOrg.organization_name || "the organization"}&apos;s
          roster.
        </p>
      )}
      {isError && (
        <p role="alert" className="text-sm text-destructive">
          Couldn’t load organizations.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </p>
      )}
      {!isPending && !isError && !organizations.length && (
        <p className="text-sm text-muted-foreground">
          Join or create an organization to add this artist.
        </p>
      )}
    </div>
  );
};

export default AddToOrgButton;
