import { humanizeToolName } from "./humanizeToolName";

interface ToolInfo {
  /** Past-tense summary shown on the success card. */
  message: string;
  /** Present-tense label shown while the tool is running. */
  runningLabel: string;
}

function getToolInfo(toolName: string): ToolInfo {
  // Spotify related tools
  if (toolName.includes("spotify")) {
    return {
      message: "Music data retrieved",
      runningLabel: "Pulling Spotify data",
    };
  }
  // Artist data tools
  else if (
    toolName === "get_artist_socials" ||
    toolName === "create_new_artist"
  ) {
    return {
      message: "Artist data processed",
      runningLabel: "Working with artist data",
    };
  }
  // Contact team
  else if (toolName === "contact_team") {
    return {
      message: "Team contacted",
      runningLabel: "Contacting the team",
    };
  }
  // Search Web
  else if (toolName === "search_web") {
    return {
      message: "Information retrieved",
      runningLabel: "Searching the web",
    };
  }
  // Connector tools
  else if (toolName === "COMPOSIO_MANAGE_CONNECTIONS") {
    return {
      message: "Connection managed",
      runningLabel: "Managing connection",
    };
  } else if (toolName === "COMPOSIO_SEARCH_TOOLS") {
    return {
      message: "Tools discovered",
      runningLabel: "Discovering tools",
    };
  } else if (toolName === "COMPOSIO_GET_TOOL_SCHEMAS") {
    return {
      message: "Tool details retrieved",
      runningLabel: "Reading tool details",
    };
  } else if (toolName === "COMPOSIO_MULTI_EXECUTE_TOOL") {
    return {
      message: "Action executed",
      runningLabel: "Executing action",
    };
  }
  // Default for any other tool — derive a readable label from the tool name.
  else {
    return {
      message: "Data processed",
      runningLabel: `Running ${humanizeToolName(toolName)}`,
    };
  }
}

export default getToolInfo;
