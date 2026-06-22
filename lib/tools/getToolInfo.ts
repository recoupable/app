import { humanizeToolName } from "./humanizeToolName";

interface ToolInfo {
  /** Past-tense summary shown on the success card. */
  message: string;
  /** Present-tense label shown while the tool is running. */
  runningLabel: string;
  /**
   * Plain-English, non-technical explanation of what this kind of tool does —
   * shown as a subtitle so a non-technical user understands an unfamiliar
   * (often MCP/automation) step instead of seeing a bare tool name.
   */
  description: string;
}

function getToolInfo(toolName: string): ToolInfo {
  const name = toolName.toLowerCase();

  if (name.includes("spotify")) {
    return {
      message: "Music data retrieved",
      runningLabel: "Pulling Spotify data",
      description: "Looks up music data on Spotify.",
    };
  } else if (
    toolName === "get_artist_socials" ||
    toolName === "create_new_artist"
  ) {
    return {
      message: "Artist data processed",
      runningLabel: "Working with artist data",
      description: "Reads or updates this artist's profile.",
    };
  } else if (toolName === "contact_team") {
    return {
      message: "Team contacted",
      runningLabel: "Contacting the team",
      description: "Sends a message to the Recoup team.",
    };
  } else if (toolName === "search_web") {
    return {
      message: "Information retrieved",
      runningLabel: "Searching the web",
      description: "Searches the web for up-to-date information.",
    };
  } else if (name.startsWith("composio")) {
    return {
      message: "Connection managed",
      runningLabel: "Managing connection",
      description: "Manages a connected app or runs an action in it.",
    };
  } else if (
    name.includes("bash") ||
    name.includes("shell") ||
    name.includes("command") ||
    name.includes("sandbox") ||
    name.includes("terminal")
  ) {
    return {
      message: "Command finished",
      runningLabel: "Running a command",
      description: "Runs a command in a secure sandbox to do work for you.",
    };
  } else if (name.includes("email") || name.includes("send")) {
    return {
      message: "Message sent",
      runningLabel: "Sending",
      description: "Sends a message on your behalf.",
    };
  } else if (
    name.startsWith("get") ||
    name.startsWith("list") ||
    name.startsWith("read") ||
    name.startsWith("fetch") ||
    name.includes("search")
  ) {
    return {
      message: "Data retrieved",
      runningLabel: `Looking up ${humanizeToolName(toolName).toLowerCase()}`,
      description: "Looks up information to answer your request.",
    };
  }
  // Default for any other tool — derive a readable label from the tool name.
  return {
    message: "Step complete",
    runningLabel: `Running ${humanizeToolName(toolName)}`,
    description: "Runs an automated step to complete your request.",
  };
}

export default getToolInfo;
