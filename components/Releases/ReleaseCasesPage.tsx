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
import CatalogReleaseStreams from "./CatalogReleaseStreams";
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
  const currentKey = JSON.stringify([
    accountId,
    selectedOrgId,
    current?.request_id,
    current?.fingerprint,
  ]);
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
      <h1 className="font-heading text-2xl font-semibold">Releases</h1>
      {accountId && (
        <CatalogReleaseStreams
          key={JSON.stringify([accountId, selectedOrgId])}
          accountId={accountId}
          organizationId={selectedOrgId}
          getAccessToken={getAccessToken}
        />
      )}
      <details className="space-y-5">
        <summary className="w-fit cursor-pointer text-sm text-muted-foreground">
          Metadata reviews
        </summary>
        <Button
          variant="outline"
          disabled={!accountId || cases.busy}
          onClick={() => void cases.reload()}
        >
          Refresh list
        </Button>
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
            <ReleaseCaseDetails
              key={"case" + currentKey}
              current={current}
              busy={cases.busy}
              onReview={cases.review}
              onReload={() => cases.open(current.request_id)}
            />
            <CompanyAssessment
              key={"assessment" + currentKey}
              requestId={current.request_id}
              organizationId={selectedOrgId}
              getAccessToken={getAccessToken}
            />
          </>
        )}
      </details>
    </div>
  );
}
