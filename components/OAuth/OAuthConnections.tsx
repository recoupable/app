"use client";
import { usePrivy } from "@privy-io/react-auth";
import OAuthConnectionsSession from "./OAuthConnectionsSession";

export default function OAuthConnections({ issuer }: { issuer: string }) {
  const auth = usePrivy();
  // Pending loads and disconnects belong only to the session that started them.
  const sessionKey = JSON.stringify([
    issuer,
    auth.ready,
    auth.authenticated,
    auth.user?.id,
  ]);
  return (
    <OAuthConnectionsSession key={sessionKey} issuer={issuer} auth={auth} />
  );
}
