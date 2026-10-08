"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useReleaseCases } from "@/hooks/useReleaseCases";
import { Button } from "@/components/ui/button";
import ReleaseCasesList from "./ReleaseCasesList";
import ReleaseCaseDetails from "./ReleaseCaseDetails";
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
      {cases.error && (
        <p role="alert" className="text-destructive">
          {cases.error}
        </p>
      )}
      {cases.busy && <p role="status">Loading…</p>}
      <ReleaseCasesList cases={cases} />
      {current && (
        <ReleaseCaseDetails
          key={JSON.stringify([
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
      )}
    </div>
  );
}
