"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import useCatalogs from "@/hooks/useCatalogs";
import { useNewChatBootstrap } from "@/hooks/useNewChatBootstrap";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";
import FirstTaskReportRun from "./FirstTaskReportRun";
import SetupSkipLink from "./SetupSkipLink";

/**
 * Final step of the canonical `/setup/*` sequence (chat#1867, chat#1889),
 * mounted by `/setup/tasks`: pre-run the first weekly catalog report, show it
 * finished, then ask "get this every Monday?". Self-contained — provisions its
 * own chat session (the same infrastructure a normal send uses).
 *
 * Carries the gate's "skip for now" escape hatch, since home forwards
 * incomplete accounts into the sequence.
 */
const FirstTaskStep = () => {
  const { selectedArtist, isLoading: isArtistsLoading } = useArtistProvider();
  const catalogsQuery = useCatalogs();
  const bootstrap = useNewChatBootstrap();
  const { user, ready } = usePrivy();
  const artistName = selectedArtist?.name;
  const artistAccountId = selectedArtist?.account_id;
  // The weekly report is emailed to the account holder — same address the
  // scheduled task uses (useConfirmFirstTask), so the preview matches the send.
  const recipientEmail = user?.email?.address;

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
      ) : ready && artistName && artistAccountId && !recipientEmail ? (
        // Distinct from "loading": a wallet/phone/social-only Privy login has no
        // email to deliver the report to — retrying never resolves it.
        <p className="text-sm text-destructive" role="alert">
          Add an email address to your account to receive your weekly report.
        </p>
      ) : isPreparing ||
        bootstrap.status !== "ready" ||
        !artistName ||
        !artistAccountId ||
        !recipientEmail ? (
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
          prompt={buildFirstTaskPrompt({
            artistName,
            artistAccountId,
            recipientEmail,
            catalogName,
          })}
          catalogName={catalogName}
        />
      )}
      <SetupSkipLink />
    </div>
  );
};

export default FirstTaskStep;
