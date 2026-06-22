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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

/** Only allow https redirect targets; otherwise return "#" as a safe no-op. */
function toSafeRedirect(redirectUrl: string): string {
  try {
    return new URL(redirectUrl).protocol === "https:" ? redirectUrl : "#";
  } catch {
    return "#";
  }
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
  const safeRedirect = toSafeRedirect(redirectUrl);
  const isUnsafe = safeRedirect === "#";

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

        {isUnsafe ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            This connection link looks invalid. Please ask to reconnect.
          </div>
        ) : (
          <Button asChild className="w-full">
            <a
              href={safeRedirect}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon className="size-4" />
              <span>Connect {displayName}</span>
              <ArrowUpRight className={cn("size-4 opacity-80")} />
            </a>
          </Button>
        )}

        <p className="text-center text-xs text-muted-foreground">
          You&apos;ll be redirected to authorize access. Link expires in 10
          minutes.
        </p>
      </ToolCardBody>
    </ToolCard>
  );
}

export default ComposioConnectPrompt;
