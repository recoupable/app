import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { Sparkles } from "lucide-react";
import {
  ToolCard,
  ToolCardBody,
  ToolError,
  ToolEmpty,
  ToolStatusPill,
  ToolCardSkeleton,
} from "../shared";
import GenericSuccess from "../GenericSuccess";
import GetChatsResult from "../chats/GetChatsResult";
import SearchApiResult from "../SearchWeb/SearchApiResult";
import YouTubeRevenueResult from "../youtube/YouTubeRevenueResult";
import GetSpotifyArtistAlbumsResult from "../GetSpotifyArtistAlbumsResult";
import GetArtistSocialsResult from "../GetArtistSocialsResult";
import ComposioConnectPrompt from "../composio/ComposioConnectPrompt";
import ComposioConnectedState from "../composio/ComposioConnectedState";
import { StoryBoundary } from "./StoryBoundary";

const IMG = "/dashboard.png";

const chats: React.ComponentProps<typeof GetChatsResult>["result"] = {
  chats: [
    { id: "1", title: "Q3 release strategy for Nova", sessionId: "s1", accountId: "a1", updatedAt: new Date().toISOString() },
    { id: "2", title: "TikTok campaign brainstorm", sessionId: "s1", accountId: "a1", updatedAt: new Date().toISOString() },
    { id: "3", title: "Untitled Chat", sessionId: "s1", accountId: "a1", updatedAt: new Date().toISOString() },
  ],
};
const search: React.ComponentProps<typeof SearchApiResult>["result"] = {
  formatted: "",
  results: [
    { title: "Nova announces sophomore album 'Aurora' — Pitchfork", url: "https://pitchfork.com/news/nova-aurora", snippet: "The rising pop artist revealed a 12-track record arriving this fall, produced with longtime collaborator Jae Park.", date: "2026-05-12" },
    { title: "How Nova built a 2M-strong fanbase on short-form video", url: "https://www.rollingstone.com/music/nova-fanbase", snippet: "A look at the creative strategy behind one of the year's fastest-growing independent acts.", date: "2026-04-28" },
  ],
};
const youtube: React.ComponentProps<typeof YouTubeRevenueResult>["result"] = {
  success: true,
  status: "ok",
  revenueData: {
    totalRevenue: 4821.57,
    dailyRevenue: Array.from({ length: 7 }).map((_, i) => ({ date: `2026-06-${String(14 + i).padStart(2, "0")}`, revenue: 420 + Math.round(Math.sin(i) * 180 + i * 60) })),
    dateRange: { startDate: "2026-06-14", endDate: "2026-06-20" },
    channelId: "UC123",
    isMonetized: true,
  },
};
// Partial fixture asserted to the result type — stories only exercise the
// fields the component reads (cover art, name, release year, artist name).
const albums = {
  total: 9,
  items: [
    { id: "al1", name: "Aurora", release_date: "2026-09-04", images: [{ url: IMG }], artists: [{ id: "a1", name: "Nova" }], type: "album" },
    { id: "al2", name: "Midnight Drives", release_date: "2024-03-15", images: [{ url: IMG }], artists: [{ id: "a1", name: "Nova" }], type: "album" },
    { id: "al3", name: "First Light - EP", release_date: "2022-07-01", images: [{ url: IMG }], artists: [{ id: "a1", name: "Nova" }], type: "album" },
  ],
} as unknown as React.ComponentProps<typeof GetSpotifyArtistAlbumsResult>["result"];
const socials = {
  status: "success",
  socials: [
    { id: "s1", profile_url: "instagram.com/novamusic", follower_count: 1200000 },
    { id: "s2", profile_url: "youtube.com/@novamusic", follower_count: 480000 },
    { id: "s3", profile_url: "tiktok.com/@novamusic", follower_count: 2100000 },
    { id: "s4", profile_url: "spotify.com/artist/nova", follower_count: 95000 },
  ],
} as unknown as React.ComponentProps<typeof GetArtistSocialsResult>["result"];

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <StoryBoundary label={title}>
        <div className="space-y-4">{children}</div>
      </StoryBoundary>
    </div>
  );
}

const meta: Meta = { title: "Chat Tools/Gallery", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

/** Every state composed on one canvas — used for the PR overview screenshots. */
export const AllStates: Story = {
  render: () => (
    <div className="mx-auto max-w-md space-y-10 p-6">
      <Section title="Design system — states">
        <ToolStatusPill label="Searching the web" />
        <ToolCardSkeleton icon={Sparkles} label="Loading results" rows={3} />
        <ToolError title="search_web" message="The upstream provider timed out after 30s." onRetry={() => {}} />
        <ToolCard icon={Sparkles} tone="info" title="Web search" subtitle="0 results">
          <ToolCardBody>
            <ToolEmpty icon={Sparkles} title="No results found" description="Try a broader query or different keywords." />
          </ToolCardBody>
        </ToolCard>
        <GenericSuccess name="send_email" message="Email sent to the team" />
      </Section>
      <Section title="Conversations"><GetChatsResult result={chats} /></Section>
      <Section title="Web research"><SearchApiResult result={search} /></Section>
      <Section title="YouTube revenue"><YouTubeRevenueResult result={youtube} /></Section>
      <Section title="Spotify discography"><GetSpotifyArtistAlbumsResult result={albums} /></Section>
      <Section title="Artist socials"><GetArtistSocialsResult result={socials} /></Section>
      <Section title="Connectors">
        <ComposioConnectPrompt displayName="Google Sheets" redirectUrl="https://example.com/connect" connector="google_sheets" />
        <ComposioConnectedState displayName="Gmail" />
      </Section>
    </div>
  ),
};
