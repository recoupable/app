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
import ReleaseStreams from "./ReleaseStreams";
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
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Release reviews
          </h1>
          <p className="mt-2 text-muted-foreground">
            Check saved metadata and its sources in your selected workspace.
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
      <ReleaseCasesList cases={cases} />
      {current && (
        <>
          {accountId && current.tracks.length > 0 && (
            <ReleaseStreams
              key={JSON.stringify([
                "streams",
                accountId,
                selectedOrgId,
                current.request_id,
                current.fingerprint,
              ])}
              current={current}
              accountId={selectedOrgId ?? accountId}
              getAccessToken={getAccessToken}
            />
          )}
          {current.tracks.length === 0 && (
            <section
              aria-label="Release streams"
              className="space-y-2 rounded-xl bg-card p-6 shadow-[0_0_0_1px_var(--border)]"
            >
              <h2 className="text-xl font-semibold">Streams</h2>
              <p className="text-sm text-muted-foreground">
                Save this release’s recording metadata and ISRCs to match its
                daily stream history.
              </p>
            </section>
          )}
          <ReleaseCaseDetails
            key={JSON.stringify([
              "case",
              accountId,
              selectedOrgId,
              current.request_id,
              current.fingerprint,
            ])}
            current={current}
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
    </div>
  );
}
