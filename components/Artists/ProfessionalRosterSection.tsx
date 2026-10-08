"use client";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useProfessionalRoster } from "@/hooks/useProfessionalRoster";
import { ProfessionalRequestError } from "@/lib/professionals/ProfessionalRequestError";
import { Button } from "@/components/ui/button";

export default function ProfessionalRosterSection() {
  const { selectedOrgId } = useOrganization();
  const roster = useProfessionalRoster(selectedOrgId);
  if (!selectedOrgId) return null;
  const denied =
    roster.error instanceof ProfessionalRequestError &&
    [401, 403].includes(roster.error.status);
  return (
    <section
      className="w-full space-y-3"
      aria-label="Songwriters and producers"
    >
      <h2 className="text-xl font-medium">Songwriters &amp; producers</h2>
      {roster.isError && (!roster.data || denied) ? (
        <div role="alert">
          Could not load this organization’s professional roster.{" "}
          <Button variant="outline" onClick={() => roster.refetch()}>
            Retry roster
          </Button>
        </div>
      ) : roster.isLoading ? (
        <p role="status">Loading professional roster…</p>
      ) : !roster.data ? (
        <p>Sign in to view this organization’s professional roster.</p>
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
          {roster.isError && (
            <div role="alert">
              <p>
                {roster.isFetchNextPageError
                  ? "Could not load more professionals."
                  : "Could not refresh the roster."}{" "}
                Your loaded records are still shown.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  roster.isFetchNextPageError
                    ? roster.fetchNextPage()
                    : roster.refetch()
                }
              >
                Retry roster
              </Button>
            </div>
          )}
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
