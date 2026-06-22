import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import GetChatsResult from "../chats/GetChatsResult";
import GetChatsSkeleton from "../chats/GetChatsSkeleton";
import SearchApiResult from "../SearchWeb/SearchApiResult";
import SearchWebSkeleton from "../SearchWeb/SearchWebSkeleton";
import SearchWebProgress from "../SearchWeb/SearchWebProgress";
import GetSpotifyArtistAlbumsResult from "../GetSpotifyArtistAlbumsResult";
import GetSpotifyArtistAlbumsSkeleton from "../GetSpotifyArtistAlbumsSkeleton";
import SpotifyArtistTopTracksResult from "../SpotifyArtistTopTracksResult";
import SpotifyArtistTopTracksSkeleton from "../SpotifyArtistTopTracksSkeleton";
import GetSpotifySearchToolResult from "../GetSpotifySearchToolResult";
import SpotifyDeepResearchSkeleton from "../SpotifyDeepResearchSkeleton";
import YouTubeRevenueResult from "../youtube/YouTubeRevenueResult";
import YouTubeRevenueSkeleton from "../youtube/YouTubeRevenueSkeleton";
import GetArtistSocialsResult from "../GetArtistSocialsResult";
import GetArtistSocialsSkeleton from "../GetArtistSocialsSkeleton";
import ComposioConnectPrompt from "../composio/ComposioConnectPrompt";
import ComposioConnectedState from "../composio/ComposioConnectedState";
import { ImageSkeleton } from "../image/ImageSkeleton";
import { ImageResult } from "../image/ImageResult";
import CatalogSongsSkeleton from "../catalog/CatalogSongsSkeleton";
import GenericSuccess from "../GenericSuccess";
import GenericToolCard from "../GenericToolCard";

const IMG = "/dashboard.png";
type R<C> = C extends (props: infer P) => unknown
  ? P extends { result: infer X }
    ? X
    : never
  : never;

const meta: Meta = {
  title: "Tool States",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

/* ---------------------------------------------------------------- Chats */
const chats = {
  chats: [
    { id: "1", title: "Q3 release strategy for Nova", sessionId: "s1", accountId: "a1", updatedAt: new Date().toISOString() },
    { id: "2", title: "TikTok campaign brainstorm", sessionId: "s1", accountId: "a1", updatedAt: new Date().toISOString() },
    { id: "3", title: "Untitled Chat", sessionId: "s1", accountId: "a1", updatedAt: new Date().toISOString() },
  ],
} satisfies R<typeof GetChatsResult>;
export const ChatsResult: Story = { render: () => <GetChatsResult result={chats} /> };
export const ChatsEmpty: Story = { render: () => <GetChatsResult result={{ chats: [] }} /> };
export const ChatsSkeleton: Story = { render: () => <GetChatsSkeleton /> };

/* ------------------------------------------------------------- Web search */
const search = {
  formatted: "",
  results: [
    { title: "Nova announces sophomore album 'Aurora' — Pitchfork", url: "https://pitchfork.com/news/nova-aurora", snippet: "The rising pop artist revealed a 12-track record arriving this fall.", date: "2026-05-12" },
    { title: "How Nova built a 2M fanbase on short-form video", url: "https://www.rollingstone.com/music/nova", snippet: "A look at the creative strategy behind one of the year's fastest-growing acts.", date: "2026-04-28" },
  ],
} satisfies R<typeof SearchApiResult>;
export const SearchResult: Story = { render: () => <SearchApiResult result={search} /> };
export const SearchEmpty: Story = { render: () => <SearchApiResult result={{ formatted: "", results: [] }} /> };
export const SearchSkeleton: Story = { render: () => <SearchWebSkeleton /> };
export const SearchProgress: Story = {
  render: () => (
    <SearchWebProgress
      progress={{ type: "search_progress", queries: ["Nova tour dates 2026", "Nova streaming numbers"], status: "searching" } as unknown as React.ComponentProps<typeof SearchWebProgress>["progress"]}
    />
  ),
};

/* --------------------------------------------------------------- Spotify */
const albums = {
  total: 9,
  items: [
    { id: "al1", name: "Aurora", release_date: "2026-09-04", images: [{ url: IMG }], artists: [{ id: "a1", name: "Nova" }], type: "album" },
    { id: "al2", name: "Midnight Drives", release_date: "2024-03-15", images: [{ url: IMG }], artists: [{ id: "a1", name: "Nova" }], type: "album" },
    { id: "al3", name: "First Light - EP", release_date: "2022-07-01", images: [{ url: IMG }], artists: [{ id: "a1", name: "Nova" }], type: "album" },
  ],
} as unknown as R<typeof GetSpotifyArtistAlbumsResult>;
export const SpotifyAlbumsResult: Story = { render: () => <GetSpotifyArtistAlbumsResult result={albums} /> };
export const SpotifyAlbumsSkeleton: Story = { render: () => <GetSpotifyArtistAlbumsSkeleton /> };

const tracks = {
  tracks: [
    { id: "t1", name: "Aurora", duration_ms: 201000, popularity: 88, explicit: false, album: { images: [{ url: IMG }] }, artists: [{ name: "Nova" }], external_urls: { spotify: "https://open.spotify.com" } },
    { id: "t2", name: "Midnight Drive", duration_ms: 184000, popularity: 74, explicit: true, album: { images: [{ url: IMG }] }, artists: [{ name: "Nova" }], external_urls: { spotify: "https://open.spotify.com" } },
  ],
} as unknown as R<typeof SpotifyArtistTopTracksResult>;
export const SpotifyTopTracksResult: Story = { render: () => <SpotifyArtistTopTracksResult result={tracks} /> };
export const SpotifyTopTracksSkeleton: Story = { render: () => <SpotifyArtistTopTracksSkeleton /> };
export const SpotifyDeepResearchSkeletonStory: Story = { render: () => <SpotifyDeepResearchSkeleton /> };

const spotifySearch = {
  artists: { items: [{ id: "a1", name: "Nova", images: [{ url: IMG }], type: "artist", external_urls: { spotify: "#" } }] },
  tracks: { items: [{ id: "t1", name: "Aurora", album: { images: [{ url: IMG }] }, artists: [{ name: "Nova" }], type: "track", external_urls: { spotify: "#" } }] },
} as unknown as R<typeof GetSpotifySearchToolResult>;
export const SpotifySearchResult: Story = { render: () => <GetSpotifySearchToolResult result={spotifySearch} /> };

/* --------------------------------------------------------------- YouTube */
const youtube = {
  success: true,
  status: "ok",
  revenueData: {
    totalRevenue: 4821.57,
    dailyRevenue: Array.from({ length: 7 }).map((_, i) => ({ date: `2026-06-${String(14 + i).padStart(2, "0")}`, revenue: 420 + Math.round(Math.sin(i) * 180 + i * 60) })),
    dateRange: { startDate: "2026-06-14", endDate: "2026-06-20" },
    channelId: "UC123",
    isMonetized: true,
  },
} satisfies R<typeof YouTubeRevenueResult>;
export const YouTubeResult: Story = { render: () => <YouTubeRevenueResult result={youtube} /> };
export const YouTubeError: Story = { render: () => <YouTubeRevenueResult result={{ success: false, status: "error", message: "This channel isn't connected to YouTube Analytics yet." }} /> };
export const YouTubeSkeleton: Story = { render: () => <YouTubeRevenueSkeleton /> };

/* ----------------------------------------------------------- Artist socials */
const socials = {
  status: "success",
  socials: [
    { id: "s1", profile_url: "instagram.com/novamusic", follower_count: 1200000 },
    { id: "s2", profile_url: "youtube.com/@novamusic", follower_count: 480000 },
    { id: "s3", profile_url: "tiktok.com/@novamusic", follower_count: 2100000 },
    { id: "s4", profile_url: "spotify.com/artist/nova", follower_count: 95000 },
  ],
} as unknown as R<typeof GetArtistSocialsResult>;
export const ArtistSocialsResult: Story = { render: () => <GetArtistSocialsResult result={socials} /> };
export const ArtistSocialsEmpty: Story = { render: () => <GetArtistSocialsResult result={{ status: "success", socials: [] } as unknown as R<typeof GetArtistSocialsResult>} /> };
export const ArtistSocialsSkeleton: Story = { render: () => <GetArtistSocialsSkeleton /> };

/* ------------------------------------------------------------- Connectors */
export const ComposioConnect: Story = { render: () => <ComposioConnectPrompt displayName="Google Sheets" redirectUrl="https://example.com/connect" connector="google_sheets" /> };
export const ComposioConnected: Story = { render: () => <ComposioConnectedState displayName="Gmail" /> };

/* ----------------------------------------------------------------- Media */
export const ImageLoading: Story = { render: () => <ImageSkeleton /> };
export const ImageResultStory: Story = { render: () => <ImageResult result={{ imageUrl: IMG } as unknown as R<typeof ImageResult>} /> };

/* ---------------------------------------------------------------- Catalog */
export const CatalogSkeleton: Story = { render: () => <CatalogSongsSkeleton /> };

/* ----------------------------------------------------------------- Generic */
export const GenericSuccessDefault: Story = { render: () => <GenericSuccess name="send_email" message="Email sent to the team" /> };

/* ------------------------------------------------- Generic tool clarity card */
export const ToolCardCommandLoading: Story = {
  render: () => <GenericToolCard name="bash" input={{ command: "npm run build" }} state="loading" />,
};
export const ToolCardCommandSuccess: Story = {
  render: () => (
    <GenericToolCard
      name="bash"
      input={{ command: "npm test" }}
      output={"PASS  src/lib/utils.test.ts\nTests: 72 passed, 72 total\nTime:  4.1 s"}
    />
  ),
};
/** Repeated calls of the same tool must read as distinct, intentional steps. */
export const ToolCardRepeatedCalls: Story = {
  render: () => (
    <div className="space-y-3">
      <GenericToolCard name="bash" input={{ command: "git status" }} output={"On branch main\nnothing to commit"} />
      <GenericToolCard name="bash" input={{ command: "npm install" }} output={"added 3 packages in 2s"} />
      <GenericToolCard name="bash" input={{ command: "npm run build" }} state="loading" />
    </div>
  ),
};
export const ToolCardMcpTool: Story = {
  render: () => (
    <GenericToolCard
      name="COMPOSIO_GMAIL_SEND_EMAIL"
      input={{ recipient: "team@recoup.app", subject: "Weekly report" }}
      output={{ message: "Email sent", id: "msg_123" }}
    />
  ),
};
