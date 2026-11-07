"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import useCatalogs from "@/hooks/useCatalogs";
import { useNewChatBootstrap } from "@/hooks/useNewChatBootstrap";
import { useReportRunDecision } from "@/hooks/useReportRunDecision";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";
import FirstTaskReportRun from "./FirstTaskReportRun";
import SetupSkipLink from "./SetupSkipLink";

/**
 * The first monthly report, once FirstTaskStep has ruled out an existing
 * schedule: provisions a chat session, pre-runs the report and hands the
 * per-run `autoCreate` decision to the schedule step (recoupable/app#1941).
 */
const FirstTaskReport = ({ autoCreate }: { autoCreate: boolean }) => {
  const { selectedArtist, isLoading: isArtistsLoading } = useArtistProvider();
  const catalogsQuery = useCatalogs();
  const bootstrap = useNewChatBootstrap();
  const { user, ready } = usePrivy();
  const artistName = selectedArtist?.name;
  const artistAccountId = selectedArtist?.account_id;
  // Same address the scheduled task emails, so the preview matches the send.
  const recipientEmail = user?.email?.address;

  // Wait for catalogs so the pre-run prompt matches the scheduled task's.
  const isPreparing =
    isArtistsLoading || catalogsQuery.isLoading || bootstrap.status !== "ready";
  const catalogName = catalogsQuery.data?.catalogs?.[0]?.name;
  const willSchedule = useReportRunDecision(
    bootstrap.status === "ready" ? bootstrap.chatId : undefined,
    autoCreate,
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <header>
        <h1 className="text-xl font-semibold text-foreground">
          {willSchedule
            ? "Your first monthly report"
            : `Catalog report for ${artistName ?? "your artist"}`}
        </h1>
        {/* Only promise a schedule this step is about to create. */}
        {willSchedule && (
          <p className="text-sm text-muted-foreground">
            {artistName
              ? `Your catalog report for ${artistName}. Recoup will email you an update like this every month.`
              : "Recoup will email you an update like this every month."}
          </p>
        )}
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
          Add an email address to your account to receive your monthly report.
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
          autoCreate={willSchedule}
        />
      )}
      <SetupSkipLink />
    </div>
  );
};

export default FirstTaskReport;
