import { ImageSkeleton } from "@/components/VercelChat/tools/image/ImageSkeleton";
import { ImageResult } from "@/components/VercelChat/tools/image/ImageResult";
import {
  ImageGenerationResult,
  ScheduledAction,
  RetrieveVideoContentResult,
} from "@/components/VercelChat/types";
import dynamic from "next/dynamic";
import CreateArtistToolCall from "./tools/CreateArtistToolCall";
import CreateArtistToolResult from "./tools/CreateArtistToolResult";
import { CreateArtistResult } from "@/types/createArtistResult";
import GetSpotifySearchToolResult from "./tools/GetSpotifySearchToolResult";
import {
  SpotifyDeepResearchResultUIType,
  SpotifyArtistTopTracksResultType,
  SpotifySearchResponse,
} from "@/types/spotify";
import { SocialsResponse } from "@/types/Social";
import { ToolUIPart, getToolOrDynamicToolName, DynamicToolUIPart } from "ai";
import UpdateArtistInfoSuccess from "./tools/UpdateArtistInfoSuccess";
import { UpdateAccountInfoResult } from "./tools/UpdateArtistInfoSuccess";
import UpdateArtistSocialsSuccess from "./tools/UpdateArtistSocialsSuccess";
import { UpdateArtistSocialsResult } from "./tools/UpdateArtistSocialsSuccess";
import { TxtFileResult } from "@/components/ui/TxtFileResult";
import { TxtFileGenerationResult } from "@/components/ui/TxtFileResult";
import GenericSuccess from "./tools/GenericSuccess";
import getToolInfo from "@/lib/utils/getToolsInfo";
import { isSearchProgressUpdate } from "@/lib/search/searchProgressUtils";
import YouTubeRevenueResult, {
  type YouTubeRevenueResult as YouTubeRevenueResultType,
} from "./tools/youtube/YouTubeRevenueResult";
import YouTubeRevenueSkeleton from "./tools/youtube/YouTubeRevenueSkeleton";
import SearchWebSkeleton from "./tools/SearchWeb/SearchWebSkeleton";
import SpotifyDeepResearchSkeleton from "./tools/SpotifyDeepResearchSkeleton";
import { SearchApiResultType } from "./tools/SearchWeb/SearchApiResult";
import SearchApiResult from "./tools/SearchWeb/SearchApiResult";
import SearchWebProgress from "./tools/SearchWeb/SearchWebProgress";
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
    import("./tools/sora2/Sora2VideoResult").then(
      (mod) => mod.Sora2VideoResult,
    ),
  { ssr: false, loading: () => <Sora2VideoSkeleton /> },
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
import RunSandboxCommandResultWithPolling from "./tools/sandbox/RunSandboxCommandResultWithPolling";
import ToolError from "./tools/shared/ToolError";
import ToolStatusPill from "./tools/shared/ToolStatusPill";

type CallToolResult = {
  content: TextContent[];
};

/**
 * Unified error surface for any tool that resolves to `output-error`.
 * Without this, failed tools fell through to the loading skeleton and
 * appeared to hang forever.
 */
export function getToolErrorComponent(
  part: ToolUIPart | DynamicToolUIPart,
  onRetry?: () => void,
) {
  const { toolCallId } = part;
  const toolName = getToolOrDynamicToolName(part);
  const errorText = (part as { errorText?: string }).errorText;
  return (
    <div key={toolCallId}>
      <ToolError title={toolName} message={errorText} onRetry={onRetry} />
    </div>
  );
}

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

export function getToolResultComponent(part: ToolUIPart | DynamicToolUIPart) {
  const { toolCallId, output, type } = part;
  const isMcp = type === "dynamic-tool";
  const result = isMcp
    ? JSON.parse((output as CallToolResult).content[0].text)
    : output;
  const toolName = getToolOrDynamicToolName(part);
  const isSearchWebTool = toolName === "search_web";

  if (toolName === "generate_image" || toolName === "edit_image") {
    return (
      <div key={toolCallId}>
        <ImageResult result={result as ImageGenerationResult} />
      </div>
    );
  } else if (toolName === "create_new_artist") {
    return (
      <div key={toolCallId}>
        <CreateArtistToolResult result={result as CreateArtistResult} />
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
  } else if (toolName === "get_youtube_revenue") {
    return (
      <div key={toolCallId}>
        <YouTubeRevenueResult result={result as YouTubeRevenueResultType} />
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
        <GetArtistSocialsResult result={result as SocialsResponse} />
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
  } else if (
    toolName === "get_task_run_status" ||
    toolName === "prompt_sandbox"
  ) {
    const runId =
      toolName === "get_task_run_status"
        ? ((part as DynamicToolUIPart).input as { runId: string }).runId
        : (result as { runId: string }).runId;
    return (
      <div key={toolCallId}>
        <RunSandboxCommandResultWithPolling runId={runId} />
      </div>
    );
  }

  // Default generic result for other tools
  return (
    <GenericSuccess
      key={toolCallId}
      name={toolName}
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
