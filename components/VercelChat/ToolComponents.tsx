import { ImageSkeleton } from "@/components/VercelChat/tools/image/ImageSkeleton";
import { ImageResult } from "@/components/VercelChat/tools/image/ImageResult";
import {
  ImageGenerationResult,
  ScheduledAction,
  RetrieveVideoContentResult,
} from "@/components/VercelChat/types";
import { MermaidDiagramSkeleton } from "@/components/VercelChat/tools/mermaid/MermaidDiagramSkeleton";
import dynamic from "next/dynamic";

const MermaidDiagram = dynamic(
  () => import("@/components/VercelChat/tools/mermaid/MermaidDiagram"),
  { ssr: false, loading: () => <MermaidDiagramSkeleton /> }
);
import { GenerateMermaidDiagramResult } from "@/lib/tools/generateMermaidDiagram";
import CreateArtistToolCall from "./tools/CreateArtistToolCall";
import CreateArtistToolResult from "./tools/CreateArtistToolResult";
import { CreateArtistResult } from "@/types/createArtistResult";
import DeleteArtistToolCall from "./tools/DeleteArtistToolCall";
import DeleteArtistToolResult from "./tools/DeleteArtistToolResult";
import { DeleteArtistResult } from "@/lib/tools/deleteArtist";
import GetSpotifySearchToolResult from "./tools/GetSpotifySearchToolResult";
import {
  SpotifyDeepResearchResultUIType,
  SpotifyArtistTopTracksResultType,
  SpotifySearchResponse,
} from "@/types/spotify";
import { ArtistSocialsResultType } from "@/types/ArtistSocials";
import { ToolUIPart, getToolOrDynamicToolName, DynamicToolUIPart } from "ai";
import UpdateArtistInfoSuccess from "./tools/UpdateArtistInfoSuccess";
import { UpdateAccountInfoResult } from "./tools/UpdateArtistInfoSuccess";
import UpdateArtistSocialsSuccess from "./tools/UpdateArtistSocialsSuccess";
import { UpdateArtistSocialsResult } from "./tools/UpdateArtistSocialsSuccess";
import { TxtFileResult } from "@/components/ui/TxtFileResult";
import { TxtFileGenerationResult } from "@/components/ui/TxtFileResult";
import { Loader } from "lucide-react";
import { getDisplayToolName } from "@/lib/tools/get-tools-name";
import GenericSuccess from "./tools/GenericSuccess";
import getToolInfo from "@/lib/utils/getToolsInfo";
import { BrowserToolSkeleton } from "./BrowserToolSkeleton";
import type { BrowserToolResultType } from "./tools/browser/BrowserToolResult";

const BrowserToolResult = dynamic(
  () =>
    import("./tools/browser/BrowserToolResult").then(
      (mod) => mod.BrowserToolResult
    ),
  { ssr: false, loading: () => <BrowserToolSkeleton toolName="browser_agent" /> }
);
import { isSearchProgressUpdate } from "@/lib/search/searchProgressUtils";
import { GetSpotifyPlayButtonClickedResult } from "@/lib/supabase/getSpotifyPlayButtonClicked";
import GetVideoGameCampaignPlaysResultComponent from "./tools/GetVideoGameCampaignPlaysResult";
import { CommentsResult } from "@/components/Chat/comments/CommentsResult";
import { CommentsResultData } from "@/types/Comment";
import CommentsResultSkeleton from "@/components/Chat/comments/CommentsResultSkeleton";
import GetSegmentFansResult from "./tools/segment-fans/GetSegmentFansResult";
import GetSegmentFansResultSkeleton from "./tools/segment-fans/GetSegmentFansResultSkeleton";
import { SegmentFansResult } from "@/types/fans";
import YouTubeAccessSkeleton from "./tools/youtube/YouTubeAccessSkeleton";
import YouTubeRevenueResult from "./tools/youtube/YouTubeRevenueResult";
import YouTubeRevenueSkeleton from "./tools/youtube/YouTubeRevenueSkeleton";
import {
  YouTubeChannelInfoResult,
  YouTubeChannelVideoListResult,
  YouTubeRevenueResult as YouTubeRevenueResultType,
} from "@/types/youtube";
import YouTubeChannelsResult from "./tools/youtube/YouTubeChannelsResult";
import YouTubeLoginResult from "./tools/youtube/YouTubeLoginResult";
import { YouTubeLoginResultType } from "./tools/youtube/YouTubeLoginResult";
import YoutubeChannelVideosListResult from "./tools/youtube/YoutubeChannelVideosListResult";
import YouTubeChannelVideosListSkeleton from "./tools/youtube/YouTubeChannelVideosListSkeleton";
import YouTubeSetThumbnailResult from "./tools/youtube/YouTubeSetThumbnailResult";
import YouTubeSetThumbnailSkeleton from "./tools/youtube/YouTubeSetThumbnailSkeleton";
import type { YouTubeSetThumbnailResult as YouTubeSetThumbnailResultType } from "@/types/youtube";
import SearchWebSkeleton from "./tools/SearchWeb/SearchWebSkeleton";
import { GoogleImagesSkeleton } from "./tools/GoogleImagesSkeleton";
import {
  GoogleImagesResult,
  type GoogleImagesResultType,
} from "./tools/GoogleImagesResult";
import SpotifyDeepResearchSkeleton from "./tools/SpotifyDeepResearchSkeleton";
import WebDeepResearchSkeleton from "./tools/SearchWeb/WebDeepResearchSkeleton";
import { SearchApiResultType } from "./tools/SearchWeb/SearchApiResult";
import SearchApiResult from "./tools/SearchWeb/SearchApiResult";
import SearchWebProgress from "./tools/SearchWeb/SearchWebProgress";
import WebDeepResearchProgress from "./tools/SearchWeb/WebDeepResearchProgress";
import SpotifyDeepResearchResult from "./tools/SpotifyDeepResearchResult";
import GetArtistSocialsResult from "./tools/GetArtistSocialsResult";
import GetArtistSocialsSkeleton from "./tools/GetArtistSocialsSkeleton";
import GetSpotifyArtistAlbumsResult from "./tools/GetSpotifyArtistAlbumsResult";
import { SpotifyArtistAlbumsResultUIType } from "@/types/spotify";
import GetSpotifyArtistAlbumsSkeleton from "./tools/GetSpotifyArtistAlbumsSkeleton";
import SpotifyArtistTopTracksResult from "./tools/SpotifyArtistTopTracksResult";
import SpotifyArtistTopTracksSkeleton from "./tools/SpotifyArtistTopTracksSkeleton";
import GetTasksSuccess from "./tools/tasks/GetTasksSuccess";
import CreateTaskSuccess from "./tools/tasks/CreateTaskSuccess";
import TasksSkeleton from "@/components/shared/TasksSkeleton";
import GetSpotifyAlbumWithTracksResult from "./tools/GetSpotifyAlbumWithTracksResult";
import GetSpotifyAlbumWithTracksSkeleton from "./tools/GetSpotifyAlbumWithTracksSkeleton";
import { SpotifyAlbum } from "@/types/spotify";
import DeleteTaskSuccess from "./tools/tasks/DeleteTaskSuccess";
import DeleteTaskSkeleton from "./tools/tasks/DeleteTaskSkeleton";
import UpdateTaskSuccess from "./tools/tasks/UpdateTaskSuccess";
import { Sora2VideoSkeleton } from "./tools/sora2/Sora2VideoSkeleton";

const Sora2VideoResult = dynamic(
  () =>
    import("./tools/sora2/Sora2VideoResult").then((mod) => mod.Sora2VideoResult),
  { ssr: false, loading: () => <Sora2VideoSkeleton /> }
);
import CatalogSongsSkeleton from "./tools/catalog/CatalogSongsSkeleton";
import CatalogSongsResult, {
  CatalogSongsResult as CatalogSongsResultType,
} from "./tools/catalog/CatalogSongsResult";
import {
  UpdateFileResult,
  UpdateFileResultType,
} from "./tools/files/UpdateFileResult";
import ComposioAuthResult from "./tools/composio/ComposioAuthResult";
import { TextContent } from "@modelcontextprotocol/sdk/types.js";
import PulseToolSkeleton from "./tools/pulse/PulseToolSkeleton";
import PulseToolResult, {
  PulseToolResultType,
} from "./tools/pulse/PulseToolResult";
import GetChatsSkeleton from "./tools/chats/GetChatsSkeleton";
import GetChatsResult, {
  GetChatsResultType,
} from "./tools/chats/GetChatsResult";
import RunPageSkeleton from "@/components/TasksPage/Run/RunPageSkeleton";
import SandboxCreatedResult from "./tools/sandbox/SandboxCreatedResult";
import RunSandboxCommandResultWithPolling from "./tools/sandbox/RunSandboxCommandResultWithPolling";
import PromptSandboxStreamProgress from "./tools/sandbox/PromptSandboxStreamProgress";
import type { SandboxStreamProgress } from "@/lib/sandboxes/sandboxStreamTypes";

type CallToolResult = {
  content: TextContent[];
};

export function getToolCallComponent(part: ToolUIPart) {
  const { toolCallId } = part as ToolUIPart;
  const toolName = getToolOrDynamicToolName(part);
  const isSearchWebTool = toolName === "search_web";

  if (toolName === "generate_image" || toolName === "edit_image") {
    return (
      <div key={toolCallId} className="skeleton">
        <ImageSkeleton />
      </div>
    );
  } else if (toolName === "generate_mermaid_diagram") {
    return (
      <div key={toolCallId}>
        <MermaidDiagramSkeleton />
      </div>
    );
  } else if (toolName === "create_new_artist") {
    return (
      <div key={toolCallId}>
        <CreateArtistToolCall />
      </div>
    );
  } else if (toolName === "delete_artist") {
    return (
      <div key={toolCallId}>
        <DeleteArtistToolCall />
      </div>
    );
  } else if (toolName === "get_post_comments") {
    return (
      <div key={toolCallId}>
        <CommentsResultSkeleton />
      </div>
    );
  } else if (toolName === "get_segment_fans") {
    return (
      <div key={toolCallId} className="w-full">
        <GetSegmentFansResultSkeleton />
      </div>
    );
  } else if (toolName === "get_youtube_channels") {
    return (
      <div key={toolCallId}>
        <YouTubeAccessSkeleton />
      </div>
    );
  } else if (toolName === "get_youtube_revenue") {
    return (
      <div key={toolCallId}>
        <YouTubeRevenueSkeleton />
      </div>
    );
  } else if (toolName === "get_youtube_channel_video_list") {
    return (
      <div key={toolCallId}>
        <YouTubeChannelVideosListSkeleton />
      </div>
    );
  } else if (toolName === "set_youtube_thumbnail") {
    return (
      <div key={toolCallId}>
        <YouTubeSetThumbnailSkeleton />
      </div>
    );
  } else if (isSearchWebTool) {
    return (
      <div key={toolCallId}>
        <SearchWebSkeleton />
      </div>
    );
  } else if (toolName === "search_google_images") {
    return (
      <div key={toolCallId}>
        <GoogleImagesSkeleton />
      </div>
    );
  } else if (toolName === "web_deep_research") {
    return (
      <div key={toolCallId}>
        <WebDeepResearchSkeleton />
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
    toolName === "browser_act" ||
    toolName === "browser_extract" ||
    toolName === "browser_observe" ||
    toolName === "browser_agent"
  ) {
    const toolPart = part as ToolUIPart & {
      args?: { url?: string; startUrl?: string };
    };
    const url = toolPart.args?.url || toolPart.args?.startUrl;

    return (
      <div key={toolCallId}>
        <BrowserToolSkeleton toolName={toolName} url={url} />
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
  } else if (toolName === "run_sandbox_command" || toolName === "get_task_run_status") {
    return (
      <div key={toolCallId}>
        <RunPageSkeleton />
      </div>
    );
  } else if (toolName === "prompt_sandbox") {
    return (
      <div key={toolCallId}>
        <PromptSandboxStreamProgress progress={{ status: "booting", output: "" }} />
      </div>
    );
  }

  // Default for other tools
  return (
    <div
      key={toolCallId}
      className="flex items-center gap-1 py-1 px-2 bg-muted/50 rounded-sm border border-border w-fit text-xs text-muted-foreground"
    >
      <Loader className="h-3 w-3 animate-spin text-foreground" />
      <span>Using {getDisplayToolName(toolName)}</span>
    </div>
  );
}

export function getToolResultComponent(part: ToolUIPart | DynamicToolUIPart) {
  const { toolCallId, output, type } = part;
  const isMcp = type === "dynamic-tool";
  const result = isMcp
    ? JSON.parse((output as CallToolResult).content[0].text)
    : output;
  const toolName = getToolOrDynamicToolName(part);
  const isSearchWebTool = toolName === "search_web";
  const isDeepResearchTool = toolName === "web_deep_research";

  if (toolName === "generate_image" || toolName === "edit_image") {
    return (
      <div key={toolCallId}>
        <ImageResult result={result as ImageGenerationResult} />
      </div>
    );
  } else if (
    toolName === "browser_extract" ||
    toolName === "browser_act" ||
    toolName === "browser_observe" ||
    toolName === "browser_agent"
  ) {
    return (
      <div key={toolCallId}>
        <BrowserToolResult result={result as BrowserToolResultType} />
      </div>
    );
  } else if (toolName === "generate_mermaid_diagram") {
    return (
      <div key={toolCallId}>
        <MermaidDiagram result={result as GenerateMermaidDiagramResult} />
      </div>
    );
  } else if (toolName === "create_new_artist") {
    return (
      <div key={toolCallId}>
        <CreateArtistToolResult result={result as CreateArtistResult} />
      </div>
    );
  } else if (toolName === "delete_artist") {
    return (
      <div key={toolCallId}>
        <DeleteArtistToolResult result={result as DeleteArtistResult} />
      </div>
    );
  } else if (toolName === "get_spotify_search") {
    return (
      <div key={toolCallId}>
        <GetSpotifySearchToolResult result={result as SpotifySearchResponse} />
      </div>
    );
  } else if (toolName === "update_account_info") {
    return (
      <div key={toolCallId}>
        <UpdateArtistInfoSuccess result={result as UpdateAccountInfoResult} />
      </div>
    );
  } else if (toolName === "update_artist_socials") {
    return (
      <div key={toolCallId}>
        <UpdateArtistSocialsSuccess
          result={result as UpdateArtistSocialsResult}
        />
      </div>
    );
  } else if (toolName === "generate_txt_file") {
    return (
      <div key={toolCallId}>
        <TxtFileResult result={result as TxtFileGenerationResult} />
      </div>
    );
  } else if (toolName === "get_video_game_campaign_plays") {
    return (
      <div key={toolCallId} className="w-full">
        <GetVideoGameCampaignPlaysResultComponent
          result={result as GetSpotifyPlayButtonClickedResult}
        />
      </div>
    );
  } else if (toolName === "get_post_comments") {
    return (
      <div key={toolCallId}>
        <CommentsResult result={result as CommentsResultData} />
      </div>
    );
  } else if (toolName === "get_segment_fans") {
    return (
      <div key={toolCallId} className="w-full">
        <GetSegmentFansResult result={result as SegmentFansResult} />
      </div>
    );
  } else if (toolName === "youtube_login") {
    return (
      <div key={toolCallId}>
        <YouTubeLoginResult result={result as YouTubeLoginResultType} />
      </div>
    );
  } else if (toolName === "get_youtube_channels") {
    return (
      <div key={toolCallId}>
        <YouTubeChannelsResult result={result as YouTubeChannelInfoResult} />
      </div>
    );
  } else if (toolName === "get_youtube_revenue") {
    return (
      <div key={toolCallId}>
        <YouTubeRevenueResult result={result as YouTubeRevenueResultType} />
      </div>
    );
  } else if (toolName === "get_youtube_channel_video_list") {
    return (
      <div key={toolCallId}>
        <YoutubeChannelVideosListResult
          result={result as YouTubeChannelVideoListResult}
        />
      </div>
    );
  } else if (toolName === "set_youtube_thumbnail") {
    return (
      <div key={toolCallId}>
        <YouTubeSetThumbnailResult
          result={result as YouTubeSetThumbnailResultType}
        />
      </div>
    );
  } else if (isSearchWebTool) {
    if (isSearchProgressUpdate(result)) {
      return (
        <div key={toolCallId}>
          <SearchWebProgress progress={result} />
        </div>
      );
    }

    return (
      <div key={toolCallId}>
        <SearchApiResult result={result as SearchApiResultType} />
      </div>
    );
  } else if (toolName === "search_google_images") {
    // Handle progress updates during search
    if (isSearchProgressUpdate(result)) {
      return (
        <div key={toolCallId}>
          <GoogleImagesSkeleton />
        </div>
      );
    }

    return (
      <div key={toolCallId}>
        <GoogleImagesResult result={result as GoogleImagesResultType} />
      </div>
    );
  } else if (isDeepResearchTool) {
    if (isSearchProgressUpdate(result)) {
      return (
        <div key={toolCallId}>
          <WebDeepResearchProgress progress={result} />
        </div>
      );
    }

    return null;
  } else if (toolName === "spotify_deep_research") {
    return (
      <div key={toolCallId}>
        <SpotifyDeepResearchResult
          result={result as SpotifyDeepResearchResultUIType}
        />
      </div>
    );
  } else if (toolName === "get_artist_socials") {
    return (
      <div key={toolCallId}>
        <GetArtistSocialsResult result={result as ArtistSocialsResultType} />
      </div>
    );
  } else if (toolName === "get_spotify_artist_albums") {
    return (
      <div key={toolCallId}>
        <GetSpotifyArtistAlbumsResult
          result={result as SpotifyArtistAlbumsResultUIType}
        />
      </div>
    );
  } else if (toolName === "get_spotify_artist_top_tracks") {
    return (
      <div key={toolCallId}>
        <SpotifyArtistTopTracksResult
          result={result as SpotifyArtistTopTracksResultType}
        />
      </div>
    );
  } else if (toolName === "get_tasks") {
    return (
      <div key={toolCallId}>
        <GetTasksSuccess result={result as ScheduledAction[]} />
      </div>
    );
  } else if (toolName === "create_task") {
    return (
      <div key={toolCallId}>
        <CreateTaskSuccess result={result as ScheduledAction} />
      </div>
    );
  } else if (toolName === "get_spotify_album") {
    return (
      <div key={toolCallId}>
        <GetSpotifyAlbumWithTracksResult result={result as SpotifyAlbum} />
      </div>
    );
  } else if (toolName === "delete_task") {
    return (
      <div key={toolCallId}>
        <DeleteTaskSuccess result={result as ScheduledAction} />
      </div>
    );
  } else if (toolName === "update_task") {
    return (
      <div key={toolCallId}>
        <UpdateTaskSuccess result={result as ScheduledAction} />
      </div>
    );
  } else if (toolName === "retrieve_sora_2_video_content") {
    return (
      <div key={toolCallId}>
        <Sora2VideoResult result={result as RetrieveVideoContentResult} />
      </div>
    );
  } else if (
    toolName === "insert_catalog_songs" ||
    toolName === "select_catalog_songs"
  ) {
    return (
      <div key={toolCallId}>
        <CatalogSongsResult result={result as CatalogSongsResultType} />
      </div>
    );
  } else if (toolName === "update_file") {
    return (
      <div key={toolCallId}>
        <UpdateFileResult result={result as UpdateFileResultType} />
      </div>
    );
  } else if (toolName === "COMPOSIO_MANAGE_CONNECTIONS") {
    return (
      <div key={toolCallId}>
        <ComposioAuthResult result={result} />
      </div>
    );
  } else if (toolName === "get_pulses" || toolName === "update_pulse") {
    return (
      <div key={toolCallId}>
        <PulseToolResult result={result as PulseToolResultType} />
      </div>
    );
  } else if (toolName === "get_chats") {
    return (
      <div key={toolCallId}>
        <GetChatsResult result={result as GetChatsResultType} />
      </div>
    );
  } else if (toolName === "run_sandbox_command") {
    const { runId } = result as { runId?: string };
    if (!runId) {
      const { sandboxId } = result as { sandboxId: string };
      return <SandboxCreatedResult key={toolCallId} sandboxId={sandboxId} />;
    }
    return (
      <div key={toolCallId}>
        <RunSandboxCommandResultWithPolling runId={runId} />
      </div>
    );
  } else if (toolName === "get_task_run_status") {
    const { runId } = (part as DynamicToolUIPart).input as { runId: string };
    return (
      <div key={toolCallId}>
        <RunSandboxCommandResultWithPolling runId={runId} />
      </div>
    );
  } else if (toolName === "prompt_sandbox") {
    const { runId } = result as SandboxStreamProgress;
    if (runId) {
      return (
        <div key={toolCallId}>
          <RunSandboxCommandResultWithPolling runId={runId} />
        </div>
      );
    }
    return (
      <div key={toolCallId}>
        <PromptSandboxStreamProgress progress={result as SandboxStreamProgress} />
      </div>
    );
  }

  // Default generic result for other tools
  return (
    <GenericSuccess
      key={toolCallId}
      name={getDisplayToolName(toolName)}
      message={
        (result as { message?: string }).message ??
        getToolInfo(toolName).message
      }
    />
  );
}

export const ToolComponents = {
  getToolCallComponent,
  getToolResultComponent,
};

export default ToolComponents;
