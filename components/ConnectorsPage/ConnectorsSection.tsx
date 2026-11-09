import type { ConnectorInfo } from "@/lib/composio/ConnectorInfo";
import { ConnectorCard } from "./ConnectorCard";

interface ConnectorsSectionProps {
  title: string;
  description: string;
  connectors: ConnectorInfo[];
  onConnect: (slug: string) => Promise<string | null>;
  onDisconnect: (connectedAccountId: string) => Promise<boolean>;
}

export function ConnectorsSection({
  title,
  description,
  connectors,
  onConnect,
  onDisconnect,
}: ConnectorsSectionProps) {
  if (connectors.length === 0) return null;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {connectors.map((connector) => (
          <ConnectorCard
            key={connector.slug}
            connector={connector}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        ))}
      </div>
    </section>
  );
}
