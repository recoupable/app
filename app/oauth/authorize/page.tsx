import { notFound } from "next/navigation";
import OAuthConsent from "@/components/OAuth/OAuthConsent";
import { createConsentClient } from "@/lib/oauth/createConsentClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Connect an agent | Recoup",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};

export default async function OAuthAuthorizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (process.env.OAUTH_CONSENT_ENABLED !== "true" || !process.env.OAUTH_ISSUER)
    notFound();
  const { interaction } = await searchParams;
  if (typeof interaction !== "string") notFound();
  try {
    createConsentClient(process.env.OAUTH_ISSUER, interaction);
  } catch {
    notFound();
  }
  return (
    <OAuthConsent issuer={process.env.OAUTH_ISSUER} interaction={interaction} />
  );
}
