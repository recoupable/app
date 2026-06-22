import type { ReactNode } from "react";
import { ImageSkeleton } from "@/components/VercelChat/tools/image/ImageSkeleton";
import CreateArtistToolCall from "./tools/CreateArtistToolCall";
import YouTubeRevenueSkeleton from "./tools/youtube/YouTubeRevenueSkeleton";
import SearchWebSkeleton from "./tools/SearchWeb/SearchWebSkeleton";
import SpotifyDeepResearchSkeleton from "./tools/SpotifyDeepResearchSkeleton";
import GetArtistSocialsSkeleton from "./tools/GetArtistSocialsSkeleton";
import GetSpotifyArtistAlbumsSkeleton from "./tools/GetSpotifyArtistAlbumsSkeleton";
import SpotifyArtistTopTracksSkeleton from "./tools/SpotifyArtistTopTracksSkeleton";
import TasksSkeleton from "@/components/shared/TasksSkeleton";
import GetSpotifyAlbumWithTracksSkeleton from "./tools/GetSpotifyAlbumWithTracksSkeleton";
import DeleteTaskSkeleton from "./tools/tasks/DeleteTaskSkeleton";
import { Sora2VideoSkeleton } from "./tools/sora2/Sora2VideoSkeleton";
import CatalogSongsSkeleton from "./tools/catalog/CatalogSongsSkeleton";
import PulseToolSkeleton from "./tools/pulse/PulseToolSkeleton";
import GetChatsSkeleton from "./tools/chats/GetChatsSkeleton";
import RunPageSkeleton from "@/components/TasksPage/Run/RunPageSkeleton";

/**
 * Registry mapping a tool name to its bespoke loading skeleton. Keeping this as
 * data (rather than a long if/else dispatcher) makes adding a tool a one-line
 * change and keeps `getToolCallComponent` tiny (OCP).
 */
export const TOOL_CALL_SKELETONS: Record<string, ReactNode> = {
  generate_image: (
    <div className="skeleton">
      <ImageSkeleton />
    </div>
  ),
  edit_image: (
    <div className="skeleton">
      <ImageSkeleton />
    </div>
  ),
  create_new_artist: <CreateArtistToolCall />,
  get_youtube_revenue: <YouTubeRevenueSkeleton />,
  search_web: <SearchWebSkeleton />,
  spotify_deep_research: <SpotifyDeepResearchSkeleton />,
  get_spotify_artist_albums: <GetSpotifyArtistAlbumsSkeleton />,
  get_artist_socials: <GetArtistSocialsSkeleton />,
  get_spotify_artist_top_tracks: <SpotifyArtistTopTracksSkeleton />,
  get_tasks: <TasksSkeleton />,
  create_task: <TasksSkeleton />,
  update_task: <TasksSkeleton numberOfTasks={1} />,
  get_spotify_album: <GetSpotifyAlbumWithTracksSkeleton />,
  delete_task: <DeleteTaskSkeleton />,
  retrieve_sora_2_video_content: <Sora2VideoSkeleton />,
  insert_catalog_songs: <CatalogSongsSkeleton />,
  select_catalog_songs: <CatalogSongsSkeleton />,
  get_pulses: <PulseToolSkeleton />,
  update_pulse: <PulseToolSkeleton />,
  get_chats: <GetChatsSkeleton />,
  get_task_run_status: <RunPageSkeleton />,
  prompt_sandbox: <RunPageSkeleton />,
};
