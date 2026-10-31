"use client";
import { usePrivy } from "@privy-io/react-auth";
import OAuthConsentSession from "./OAuthConsentSession";

export default function OAuthConsent({
  issuer,
  interaction,
}: {
  issuer: string;
  interaction: string;
}) {
  const auth = usePrivy();
  // Each authorization interaction and signed-in identity owns its pending decision.
  const sessionKey = JSON.stringify([
    issuer,
    interaction,
    auth.ready,
    auth.authenticated,
    auth.user?.id,
  ]);
  return (
    <OAuthConsentSession
      key={sessionKey}
      issuer={issuer}
      interaction={interaction}
      auth={auth}
    />
  );
}
