"use client";

import { ConnectorInfo } from "@/hooks/useConnectors";
import { useConnectorHandlers } from "@/hooks/useConnectorHandlers";
import { getConnectorMeta } from "@/lib/composio/connectorMetadata";
import { formatConnectorName } from "@/lib/composio/formatConnectorName";
import { getConnectorIcon } from "@/lib/composio/getConnectorIcon";
import { ConnectorConnectedMenu } from "./ConnectorConnectedMenu";
import { ConnectorEnableButton } from "./ConnectorEnableButton";

interface ConnectorCardProps {
  connector: ConnectorInfo;
  onConnect: (slug: string) => Promise<string | null>;
  onDisconnect: (connectedAccountId: string) => Promise<boolean>;
  socialAvatar?: string | null;
  socialUsername?: string | null;
}

/**
 * Card component for a single connector.
 */
export function ConnectorCard({
  connector,
  onConnect,
  onDisconnect,
  socialAvatar,
  socialUsername,
}: ConnectorCardProps) {
  const { isConnecting, isDisconnecting, handleConnect, handleDisconnect } =
    useConnectorHandlers({
      slug: connector.slug,
      connectedAccountId: connector.connectedAccountId,
      onConnect,
      onDisconnect,
    });
  const meta = getConnectorMeta(connector.slug);
  const showSocialProfile =
    connector.isConnected && (socialAvatar || socialUsername);

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card transition-all duration-200 hover:border-muted-foreground/30 hover:shadow-sm">
      <div className="shrink-0 relative">
        {showSocialProfile && socialAvatar ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={socialAvatar}
              alt={socialUsername || "Profile"}
              width={40}
              height={40}
              className="rounded-xl object-cover"
            />
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-md bg-card">
              {getConnectorIcon(connector.slug, 14)}
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl transition-colors bg-muted/50 group-hover:bg-muted">
            {getConnectorIcon(connector.slug, 22)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">
          {formatConnectorName(connector.name, connector.slug)}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {showSocialProfile && socialUsername
            ? `@${socialUsername}`
            : meta.description}
        </p>
      </div>

      <div className="shrink-0">
        {connector.isConnected ? (
          <ConnectorConnectedMenu
            isDisconnecting={isDisconnecting}
            onReconnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ) : (
          <ConnectorEnableButton
            isConnecting={isConnecting}
            onClick={handleConnect}
          />
        )}
      </div>
    </div>
  );
}
