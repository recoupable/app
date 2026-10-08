"use client";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useProfessionalRoster } from "@/hooks/useProfessionalRoster";
import { Button } from "@/components/ui/button";

export default function ProfessionalRosterSection() {
  const { selectedOrgId } = useOrganization();
  const roster = useProfessionalRoster(selectedOrgId);
  if (!selectedOrgId) return null;
  return (
    <section
      className="w-full space-y-3"
      aria-label="Songwriters and producers"
    >
      <h2 className="text-xl font-medium">Songwriters &amp; producers</h2>
      {roster.isError ? (
        <div role="alert">
          Could not load this organization’s professional roster.{" "}
          <Button variant="outline" onClick={() => roster.refetch()}>
            Retry roster
          </Button>
        </div>
      ) : roster.isPending ? (
        <p role="status">Loading professional roster…</p>
      ) : (
        <>
          {!roster.data?.pages[0]?.professionals.length && (
            <p className="text-muted-foreground">
              Add a songwriter or producer using “Add to roster”. No Spotify
              profile is required.
            </p>
          )}
          <ul className="grid gap-3 sm:grid-cols-2">
            {roster.data?.pages
              .flatMap((page) => page.professionals)
              .map((person) => (
                <li
                  key={person.id}
                  className="rounded-xl p-4 shadow-[0_0_0_1px_var(--border)]"
                >
                  <p className="font-medium">{person.name}</p>
                  <p className="capitalize text-sm text-muted-foreground">
                    {person.roles.join(" · ")}
                  </p>
                </li>
              ))}
          </ul>
          {roster.hasNextPage && (
            <Button
              variant="outline"
              disabled={roster.isFetchingNextPage}
              onClick={() => roster.fetchNextPage()}
            >
              Load more professionals
            </Button>
          )}
        </>
      )}
    </section>
  );
}
