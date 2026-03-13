export const getDisplayToolName = (name: string) => {
  // Remove default_api. prefix if present (for beta AI SDK compatibility)
  const cleanName = name.startsWith("default_api.") ? name.replace("default_api.", "") : name;

  switch (cleanName) {
    case "search_web":
      return "Search Internet";
    case "COMPOSIO_MANAGE_CONNECTIONS":
      return "Manage Connections";
    case "COMPOSIO_SEARCH_TOOLS":
      return "Search Tools";
    case "COMPOSIO_GET_TOOL_SCHEMAS":
      return "Get Tool Details";
    case "COMPOSIO_MULTI_EXECUTE_TOOL":
      return "Execute Action";
    default:
      return cleanName
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
};
