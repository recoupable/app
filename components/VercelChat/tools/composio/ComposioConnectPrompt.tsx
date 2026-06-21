import {
  FileSpreadsheet,
  HardDrive,
  FileText,
  Link2,
  Plug,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";

interface ComposioConnectPromptProps {
  displayName: string;
  redirectUrl: string;
  connector: string;
}

function resolveIcon(connector: string): LucideIcon {
  const key = connector.toLowerCase();
  if (key.includes("sheet")) return FileSpreadsheet;
  if (key.includes("drive")) return HardDrive;
  if (key.includes("docs")) return FileText;
  return Link2;
}

/**
 * Component shown when a connector needs to be connected.
 */
export function ComposioConnectPrompt({
  displayName,
  redirectUrl,
  connector,
}: ComposioConnectPromptProps) {
  const Icon = resolveIcon(connector);

  return (
    <ToolCard
      icon={Plug}
      tone="info"
      emphasized
      title={`Connect ${displayName}`}
      subtitle="Authorize access to continue"
      className="max-w-md"
    >
      <ToolCardBody className="space-y-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Connect your {displayName} account to enable this connector.
        </p>

        <a
          href={redirectUrl}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <Icon className="size-4" />
          <span>Connect {displayName}</span>
          <ArrowUpRight className="size-4 opacity-80" />
        </a>

        <p className="text-center text-xs text-muted-foreground">
          You&apos;ll be redirected to authorize access. Link expires in 10
          minutes.
        </p>
      </ToolCardBody>
    </ToolCard>
  );
}

export default ComposioConnectPrompt;
