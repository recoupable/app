import { FileSpreadsheet, HardDrive, FileText, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHttpsRedirectUrl } from "@/lib/composio/getHttpsRedirectUrl";

interface ComposioConnectPromptProps {
  displayName: string;
  redirectUrl: unknown;
  connector: string;
}

/**
 * Component shown when a connector needs to be connected.
 */
export function ComposioConnectPrompt({
  displayName,
  redirectUrl,
  connector,
}: ComposioConnectPromptProps) {
  const safeRedirect = getHttpsRedirectUrl(redirectUrl);
  const getIcon = (className = "h-5 w-5") => {
    const key = connector.toLowerCase();
    if (key.includes("sheet")) {
      return <FileSpreadsheet className={className} />;
    }
    if (key.includes("drive")) {
      return <HardDrive className={className} />;
    }
    if (key.includes("docs")) {
      return <FileText className={className} />;
    }
    return <Link2 className={className} />;
  };

  return (
    <div className="flex flex-col space-y-3 p-4 rounded-lg bg-muted border border-border my-2 max-w-md">
      <div className="flex items-center space-x-2">
        {getIcon("h-5 w-5 text-muted-foreground")}
        <span className="font-medium text-foreground">
          {displayName} Access Required
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Connect your {displayName} account to enable this connector.
      </p>

      {safeRedirect ? (
        <>
          <Button asChild className="w-full">
            <a href={safeRedirect} target="_blank" rel="noopener noreferrer">
              {getIcon("h-4 w-4")}
              <span>Connect {displayName}</span>
            </a>
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            You&apos;ll be redirected to authorize access. Link expires in 10
            minutes.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          This connection link is unavailable. Ask for a new link.
        </p>
      )}
    </div>
  );
}
