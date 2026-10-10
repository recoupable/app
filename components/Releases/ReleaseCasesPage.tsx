"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useReleaseCases } from "@/hooks/useReleaseCases";
import { Button } from "@/components/ui/button";
import ReleaseCasesList from "./ReleaseCasesList";
import ReleaseCaseDetails from "./ReleaseCaseDetails";
import CompanyAssessment from "./CompanyAssessment";
import ReleaseIntakeForm from "./ReleaseIntakeForm";
export default function ReleaseCasesPage() {
  const { ready, authenticated, getAccessToken, login } = usePrivy();
  const { userData } = useUserProvider();
  const { selectedOrgId, isInitialized } = useOrganization();
  const accountId =
    authenticated && isInitialized ? (userData?.account_id ?? null) : null;
  const cases = useReleaseCases({
    accountId,
    organizationId: selectedOrgId,
    getAccessToken,
  });
  const current = cases.current;
  if (!ready)
    return (
      <p className="p-6" role="status">
        Loading…
      </p>
    );
  if (!authenticated)
    return (
      <div className="p-6">
        <Button onClick={() => login()}>Sign in</Button>
      </div>
    );
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Releases</h1>
          <p className="mt-2 text-muted-foreground">
            Your releases, track details, and next steps.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={!accountId || cases.busy}
          onClick={() => void cases.reload()}
        >
          Refresh list
        </Button>
      </div>
      <ReleaseIntakeForm
        key={JSON.stringify([accountId, selectedOrgId])}
        disabled={!accountId || cases.busy}
        onAdd={cases.add}
      />
      {cases.notice && <p role="status">{cases.notice}</p>}
      {cases.error && (
        <p role="alert" className="text-destructive">
          {cases.error}
        </p>
      )}
      {cases.busy && <p role="status">Loading…</p>}
      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-3" aria-label="Your releases">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Your releases
          </p>
          <ReleaseCasesList cases={cases} />
        </aside>
        <div className="min-w-0 space-y-6">
          {current && (
            <>
              <ReleaseCaseDetails
                key={JSON.stringify([
                  accountId,
                  selectedOrgId,
                  current.request_id,
                  current.fingerprint,
                ])}
                current={current}
                sourceUrl={
                  cases.items.find(
                    (item) => item.request_id === current.request_id,
                  )?.url
                }
                busy={cases.busy}
                onReview={cases.review}
                onReload={() => cases.open(current.request_id)}
              />
              <CompanyAssessment
                key={JSON.stringify([
                  "assessment",
                  accountId,
                  selectedOrgId,
                  current.request_id,
                  current.fingerprint,
                ])}
                requestId={current.request_id}
                organizationId={selectedOrgId}
                getAccessToken={getAccessToken}
              />
            </>
          )}
          {!current && cases.items.length > 0 && (
            <div className="rounded-2xl bg-muted/40 px-6 py-16 text-center">
              <h2 className="font-medium">Choose a release to get started</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Open a release to see its tracks, sources, and next steps.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
