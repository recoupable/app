"use client";

import React from "react";
import { Plug } from "lucide-react";
import { formatConnectorName } from "@/lib/composio/formatConnectorName";
import { findAuthResult } from "@/lib/composio/findAuthResult";
import { hasValidAuthData } from "@/lib/composio/hasValidAuthData";
import { ComposioConnectedState } from "./ComposioConnectedState";
import { ComposioConnectPrompt } from "./ComposioConnectPrompt";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";

interface ComposioAuthResultProps {
  result: unknown;
}

/** Neutral fallback so a connect flow never silently renders nothing. */
function ComposioStatusUnknown({ displayName }: { displayName?: string }) {
  return (
    <ToolCard
      icon={Plug}
      tone="neutral"
      title="Connection status unavailable"
      subtitle={displayName ? displayName : "Connector"}
      className="max-w-md"
    >
      <ToolCardBody>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We couldn&apos;t read the connection status
          {displayName ? ` for ${displayName}` : ""}. Please try connecting
          again.
        </p>
      </ToolCardBody>
    </ToolCard>
  );
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
    return <ComposioStatusUnknown />;
  }

  const authResult = findAuthResult(result.data?.results);
  if (!authResult) {
    return <ComposioStatusUnknown />;
  }

  const connector = authResult.toolkit || "Connector";
  const displayName = formatConnectorName(connector);

  if (authResult.status?.toLowerCase() === "active") {
    return (
      <ComposioConnectedState displayName={displayName} connector={connector} />
    );
  }

  // Initiated/pending status with a redirect → show the connect CTA.
  if (authResult.redirect_url) {
    return (
      <ComposioConnectPrompt
        displayName={displayName}
        redirectUrl={authResult.redirect_url}
        connector={connector}
      />
    );
  }

  // Known connector but an unrecognized status / no redirect — render a
  // sensible fallback rather than vanishing silently.
  return <ComposioStatusUnknown displayName={displayName} />;
}

export default ComposioAuthResult;
