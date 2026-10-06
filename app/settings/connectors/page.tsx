import Link from "next/link";
import { Suspense } from "react";
import { ConnectorsPage } from "@/components/ConnectorsPage";

export default function SettingsConnectorsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <>
        {process.env.OAUTH_CONSENT_ENABLED === "true" && (
          <Link
            href="/oauth/connections"
            className="block px-6 py-3 text-sm underline"
          >
            Manage connected agents
          </Link>
        )}
        <ConnectorsPage />
      </>
    </Suspense>
  );
}
