"use client";
import Image from "next/image";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { useContextFunnel } from "@/hooks/useContextFunnel";
import ChatComposer from "@/components/VercelChat/ChatComposer";
import { Button } from "@/components/ui/button";
export default function ContextFunnel() {
  const { ready, authenticated, getAccessToken, login } = usePrivy();
  const { userData } = useUserProvider();
  const accountId = authenticated ? (userData?.account_id ?? null) : null;
  const funnel = useContextFunnel({ accountId, getAccessToken, login });
  const [url, setUrl] = useState("");
  const loading = !ready || (authenticated && !accountId);
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-medium tracking-tight">
        Start with a song.
      </h1>
      <p className="mt-3 mb-8 text-muted-foreground">
        Paste a Spotify track link. We’ll gather its artist and release details.
      </p>
      {!funnel.snapshot && !funnel.requestId && (
        <ChatComposer
          value={url}
          onChange={setUrl}
          onSubmit={(e) => {
            e.preventDefault();
            void funnel.start(url.trim());
          }}
          disabled={loading || funnel.busy}
          sendDisabled={loading || funnel.busy || !url.trim()}
          status={funnel.busy ? "submitted" : "ready"}
          submitLabel="Gather context"
          ariaLabel="Spotify track URL"
          placeholder="Paste a Spotify track link…"
          mentionsEnabled={false}
          tools={null}
        />
      )}
      {(funnel.snapshot || funnel.busy) && (
        <div
          className="rounded-xl p-6 shadow-[0_0_0_1px_var(--border)]"
          aria-live="polite"
        >
          <p className="font-medium">
            {funnel.busy
              ? "Gathering song details…"
              : ["queued", "running"].includes(funnel.snapshot?.status ?? "")
                ? "Gathering song details…"
                : funnel.snapshot?.status === "failed"
                  ? "Extraction needs another try."
                  : funnel.requestId
                    ? "Song details saved."
                    : "Is this your song?"}
          </p>
          {funnel.snapshot?.context?.release?.artwork?.[0]?.url && (
            <Image
              src={funnel.snapshot.context.release.artwork[0].url}
              alt="Release artwork"
              width={160}
              height={160}
              unoptimized
              className="mt-4 rounded-lg"
            />
          )}
          {funnel.snapshot?.context?.title && (
            <p className="mt-3">{funnel.snapshot.context.title}</p>
          )}
          {funnel.snapshot?.context?.artists && (
            <p className="text-sm text-muted-foreground">
              {funnel.snapshot.context.artists.map((a) => a.name).join(", ")}
            </p>
          )}
          {!funnel.requestId &&
            !funnel.busy &&
            funnel.snapshot?.status === "ready" && (
              <>
                <p className="my-4 text-sm text-muted-foreground">
                  {authenticated
                    ? "Keep these song details in your personal Recoup account."
                    : "Sign in to keep this work in your personal Recoup account. Your work stays here while you sign in."}
                </p>
                <Button disabled={loading || funnel.busy} onClick={funnel.save}>
                  {authenticated ? "Save to my account" : "Sign in and save"}
                </Button>
              </>
            )}
          {funnel.requestId &&
            ["completed", "partial"].includes(
              funnel.snapshot?.status ?? "",
            ) && (
              <p className="mt-3 text-sm text-muted-foreground">
                Saved to your personal account. Artist, recording, and release
                context remain available for future work.
              </p>
            )}
          {funnel.snapshot?.status === "failed" && (
            <Button
              className="mt-3"
              variant="outline"
              disabled={funnel.busy}
              onClick={funnel.refresh}
            >
              Retry extraction
            </Button>
          )}
          {funnel.snapshot && (
            <details className="mt-5">
              <summary className="cursor-pointer text-sm">
                View captured context
              </summary>
              <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs">
                {JSON.stringify(funnel.snapshot, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
      {funnel.error && (
        <div className="mt-4" role="alert">
          <p className="text-sm text-destructive">{funnel.error}</p>
          <Button className="mt-3" variant="outline" onClick={funnel.refresh}>
            Retry
          </Button>
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        This preview gathers metadata. Song analysis, research, and site
        creation are separate steps. Unclaimed work is kept for seven days.
      </p>
    </section>
  );
}
