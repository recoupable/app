"use client";

import { useArtistProvider } from "@/providers/ArtistProvider";
import useCatalogs from "@/hooks/useCatalogs";
import { useNewChatBootstrap } from "@/hooks/useNewChatBootstrap";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";
import FirstTaskReportRun from "./FirstTaskReportRun";

/**
 * Onboarding sequence final step (chat#1867): pre-run the first weekly
 * catalog report, show it finished, then ask "get this every Monday?".
 * Self-contained — provisions its own chat session (same infrastructure
 * a normal send uses) so it can slot into the OnboardingSequence
 * container later without depending on it.
 */
const FirstTaskStep = () => {
  const { selectedArtist, isLoading: isArtistsLoading } = useArtistProvider();
  const catalogsQuery = useCatalogs();
  const bootstrap = useNewChatBootstrap();
  const artistName = selectedArtist?.name;

  // Wait for catalogs so the pre-run prompt names the claimed catalog —
  // and therefore matches the scheduled task's prompt byte-for-byte.
  const isPreparing =
    isArtistsLoading || catalogsQuery.isLoading || bootstrap.status !== "ready";
  const catalogName = catalogsQuery.data?.catalogs?.[0]?.name;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <header>
        <h1 className="text-xl font-semibold text-foreground">
          Your first weekly report
        </h1>
        <p className="text-sm text-muted-foreground">
          {artistName
            ? `This week's catalog report for ${artistName} — the kind of update Recoup can send you every Monday.`
            : "The kind of update Recoup can send you every Monday."}
        </p>
      </header>
      {!isArtistsLoading && !artistName ? (
        <p className="text-sm text-muted-foreground" role="status">
          Select an artist to generate your first report.
        </p>
      ) : bootstrap.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {bootstrap.message}
        </p>
      ) : isPreparing || bootstrap.status !== "ready" || !artistName ? (
        <p
          className="animate-pulse text-sm text-muted-foreground"
          role="status"
        >
          Preparing your workspace...
        </p>
      ) : (
        <FirstTaskReportRun
          // Re-key per provisioned chat: an artist switch mints a fresh
          // session, and the remount re-arms the one-shot auto-send.
          key={bootstrap.chatId}
          sessionId={bootstrap.sessionId}
          chatId={bootstrap.chatId}
          prompt={buildFirstTaskPrompt({ artistName, catalogName })}
          catalogName={catalogName}
        />
      )}
    </div>
  );
};

export default FirstTaskStep;
