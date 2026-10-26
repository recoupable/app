"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useUserProvider } from "@/providers/UserProvder";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { Button } from "@/components/ui/button";
import CatalogAuditWorkspace from "./CatalogAuditWorkspace";

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export default function CatalogReviewsPage() {
  const { ready, authenticated, user, getAccessToken, login } = usePrivy();
  const { userData } = useUserProvider();
  const { selectedOrgId, isInitialized } = useOrganization();
  const query = useSearchParams();
  const accountId = userData?.account_id;
  const briefId = query.get("assessment");
  const queryWorkspace = query.get("workspace");
  const apiSelection = getClientApiBaseUrl();
  if (!ready)
    return (
      <p role="status" className="p-6">
        Loading…
      </p>
    );
  if (!authenticated)
    return (
      <div className="p-6">
        <Button onClick={() => login()}>Sign in to review catalogs</Button>
      </div>
    );
  if (!user?.id || !accountId || !isInitialized)
    return (
      <p role="status" className="p-6">
        Loading your workspace…
      </p>
    );
  // A shared URL never changes the selected workspace or silently falls back to personal.
  const invalid =
    (briefId !== null &&
      (!uuid.test(briefId) ||
        query.getAll("assessment").length !== 1 ||
        !queryWorkspace)) ||
    (queryWorkspace !== null &&
      (query.getAll("workspace").length !== 1 ||
        queryWorkspace !== (selectedOrgId ?? "personal")));
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <Link href="/catalogs" className="text-sm text-brand-link underline">
          Catalogs
        </Link>
        <h1 className="text-2xl font-medium tracking-tight">Catalog reviews</h1>
        <p className="text-sm text-muted-foreground">
          Review saved evidence, keep a workpaper, and continue where you left
          off.
        </p>
      </div>
      {invalid ? (
        <p role="alert">
          This assessment link belongs to a different or unresolved workspace.
          Select the original workspace, or open Catalog reviews from Catalogs.
        </p>
      ) : (
        <CatalogAuditWorkspace
          key={JSON.stringify([
            user.id,
            accountId,
            selectedOrgId,
            ready,
            authenticated,
            apiSelection,
            briefId,
          ])}
          accountId={accountId}
          organizationId={selectedOrgId}
          apiSelection={apiSelection}
          briefId={briefId}
          getAccessToken={getAccessToken}
        />
      )}
    </main>
  );
}
