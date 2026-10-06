import { notFound } from "next/navigation";
import OAuthConnections from "@/components/OAuth/OAuthConnections";
import { createConnectionsClient } from "@/lib/oauth/createConnectionsClient";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Connected agents | Recoup",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default function OAuthConnectionsPage() {
  if (process.env.OAUTH_CONSENT_ENABLED !== "true" || !process.env.OAUTH_ISSUER)
    notFound();
  try {
    createConnectionsClient(process.env.OAUTH_ISSUER);
  } catch {
    notFound();
  }
  return (
    <OAuthConnections
      key={process.env.OAUTH_ISSUER}
      issuer={process.env.OAUTH_ISSUER}
    />
  );
}
