/**
 * Get task description text for browser tool skeleton based on tool type
 *
 * @param toolName
 * @param platformName
 * @param url
 */
export function getTaskDescription(toolName: string, platformName: string, url?: string): string {
  const accountName = url?.split("/").pop()?.replace("@", "") || "";

  if (toolName === "browser_extract") {
    return `Extract the current follower count for the ${platformName} account ${accountName ? "@" + accountName : ""}.`;
  } else if (toolName === "browser_act") {
    return `Perform action on ${platformName}.`;
  } else if (toolName === "browser_observe") {
    return `Analyze available actions on ${platformName}.`;
  } else if (toolName === "browser_agent") {
    return `Autonomously navigate and extract data from ${platformName}.`;
  }

  return `Processing ${platformName}...`;
}
