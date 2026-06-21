import { ImageSkeleton } from "@/components/VercelChat/tools/image/ImageSkeleton";
import { ToolUIPart, getToolOrDynamicToolName, DynamicToolUIPart } from "ai";
import CreateArtistToolCall from "./tools/CreateArtistToolCall";
import getToolInfo from "@/lib/tools/getToolInfo";
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
import { ToolStatusPill } from "./tools/shared/ToolStatusPill";

export function getToolCallComponent(part: ToolUIPart | DynamicToolUIPart) {
  const { toolCallId } = part;
  const toolName = getToolOrDynamicToolName(part);
  const isSearchWebTool = toolName === "search_web";

  if (toolName === "generate_image" || toolName === "edit_image") {
    return (
      <div key={toolCallId} className="skeleton">
        <ImageSkeleton />
      </div>
    );
  } else if (toolName === "create_new_artist") {
    return (
      <div key={toolCallId}>
        <CreateArtistToolCall />
      </div>
    );
  } else if (toolName === "get_youtube_revenue") {
    return (
      <div key={toolCallId}>
        <YouTubeRevenueSkeleton />
      </div>
    );
  } else if (isSearchWebTool) {
    return (
      <div key={toolCallId}>
        <SearchWebSkeleton />
      </div>
    );
  } else if (toolName === "spotify_deep_research") {
    return (
      <div key={toolCallId}>
        <SpotifyDeepResearchSkeleton />
      </div>
    );
  } else if (toolName === "get_spotify_artist_albums") {
    return (
      <div key={toolCallId}>
        <GetSpotifyArtistAlbumsSkeleton />
      </div>
    );
  } else if (toolName === "get_artist_socials") {
    return (
      <div key={toolCallId}>
        <GetArtistSocialsSkeleton />
      </div>
    );
  } else if (toolName === "get_spotify_artist_top_tracks") {
    return (
      <div key={toolCallId}>
        <SpotifyArtistTopTracksSkeleton />
      </div>
    );
  } else if (toolName === "get_tasks") {
    return (
      <div key={toolCallId}>
        <TasksSkeleton />
      </div>
    );
  } else if (toolName === "get_spotify_album") {
    return (
      <div key={toolCallId}>
        <GetSpotifyAlbumWithTracksSkeleton />
      </div>
    );
  } else if (toolName === "create_task") {
    return (
      <div key={toolCallId}>
        <TasksSkeleton />
      </div>
    );
  } else if (toolName === "delete_task") {
    return (
      <div key={toolCallId}>
        <DeleteTaskSkeleton />
      </div>
    );
  } else if (toolName === "update_task") {
    return (
      <div key={toolCallId}>
        <TasksSkeleton numberOfTasks={1} />
      </div>
    );
  } else if (toolName === "retrieve_sora_2_video_content") {
    return (
      <div key={toolCallId}>
        <Sora2VideoSkeleton />
      </div>
    );
  } else if (
    toolName === "insert_catalog_songs" ||
    toolName === "select_catalog_songs"
  ) {
    return (
      <div key={toolCallId}>
        <CatalogSongsSkeleton />
      </div>
    );
  } else if (toolName === "get_pulses" || toolName === "update_pulse") {
    return (
      <div key={toolCallId}>
        <PulseToolSkeleton />
      </div>
    );
  } else if (toolName === "get_chats") {
    return (
      <div key={toolCallId}>
        <GetChatsSkeleton />
      </div>
    );
  } else if (
    toolName === "get_task_run_status" ||
    toolName === "prompt_sandbox"
  ) {
    return (
      <div key={toolCallId}>
        <RunPageSkeleton />
      </div>
    );
  }

  // Default for other tools
  return (
    <div key={toolCallId}>
      <ToolStatusPill label={getToolInfo(toolName).runningLabel} />
    </div>
  );
}
