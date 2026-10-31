"use client";

import React from "react";
import { formatConnectorName } from "@/lib/composio/formatConnectorName";
import { findAuthResult } from "@/lib/composio/findAuthResult";
import { hasValidAuthData } from "@/lib/composio/hasValidAuthData";
import { ComposioConnectedState } from "./ComposioConnectedState";
import { ComposioConnectPrompt } from "./ComposioConnectPrompt";

interface ComposioAuthResultProps {
  result: unknown;
}

/**
 * Component to display Composio authentication result.
 * Shows different UI based on connection status:
 * - "Active": Shows connected confirmation
 * - "initiated": Shows connect button
 * Returns null if no valid auth result is found.
 */
export function ComposioAuthResult({ result }: ComposioAuthResultProps) {
  if (!hasValidAuthData(result)) {
    return null;
  }

  const authResult = findAuthResult(result.data?.results);
  if (!authResult) {
    return null;
  }

  const connector = authResult.toolkit || "Connector";
  const displayName = formatConnectorName(connector);

  if (authResult.status?.toLowerCase() === "active") {
    return <ComposioConnectedState displayName={displayName} />;
  }

  return (
    <ComposioConnectPrompt
      displayName={displayName}
      redirectUrl={authResult.redirect_url}
      connector={connector}
    />
  );
}

export default ComposioAuthResult;
