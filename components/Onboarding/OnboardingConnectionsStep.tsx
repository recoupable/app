"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { OnboardingNavButtons } from "./OnboardingNavButtons";
import { cn } from "@/lib/utils";
import { useAccessToken } from "@/hooks/useAccessToken";
import { authorizeConnectorApi } from "@/lib/composio/api/authorizeConnectorApi";

const FEATURED_CONNECTORS = [
  {
    slug: "googlesheets",
    name: "Google Sheets",
    icon: "📊",
    benefit: "Sync fan data and tour reports automatically",
  },
  {
    slug: "googledrive",
    name: "Google Drive",
    icon: "📁",
    benefit: "Access EPKs, assets and files from your AI",
  },
  {
    slug: "tiktok",
    name: "TikTok",
    icon: "🎵",
    benefit: "Track viral moments and creator content",
  },
  {
    slug: "googledocs",
    name: "Google Docs",
    icon: "📝",
    benefit: "Auto-draft press releases and pitch docs",
  },
];

interface Props {
  connected: string[];
  onConnect: (slug: string) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step to connect key platform integrations during onboarding.
 */
export function OnboardingConnectionsStep({ connected, onConnect, onNext, onBack }: Props) {
  const accessToken = useAccessToken();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (slug: string) => {
    if (!accessToken) return;
    setConnecting(slug);
    try {
      const url = await authorizeConnectorApi(accessToken, {
        connector: slug,
        callbackUrl: window.location.href,
      });
      if (url) {
        const popup = window.open(url, "_blank", "noopener,noreferrer");
        if (popup) {
          // Poll until the OAuth popup closes, then record the connection.
          // This prevents marking a connector as connected if the user cancels OAuth.
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              onConnect(slug);
              setConnecting(null);
            }
          }, 500);
          return; // setConnecting(null) is handled by the interval above
        }
      }
    } catch {
      // silently continue
    }
    setConnecting(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Connect your tools
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Give Recoupable access to the places your work already lives.
          Connect what you want — skip the rest.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FEATURED_CONNECTORS.map(c => {
          const isConnected = connected.includes(c.slug);
          const isConnecting = connecting === c.slug;

          return (
            <div
              key={c.slug}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 transition-all",
                isConnected ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20",
              )}
            >
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.benefit}</p>
              </div>
              {isConnected ? (
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnect(c.slug)}
                  disabled={isConnecting}
                  className="shrink-0"
                >
                  {isConnecting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      Connect
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <OnboardingNavButtons
          onBack={onBack}
          onNext={onNext}
          nextLabel={connected.length > 0 ? `Continue with ${connected.length} connected →` : "Skip for now →"}
        />
        <p className="text-xs text-center text-muted-foreground">
          More connectors available in Settings → Connectors
        </p>
      </div>
    </div>
  );
}
