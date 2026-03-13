interface ProgressStep {
  label: string;
  completed: boolean;
  active: boolean;
}

/**
 * Get initial progress steps for browser tool skeleton based on tool type
 *
 * @param toolName
 */
export function getInitialSteps(toolName: string): ProgressStep[] {
  if (toolName === "browser_extract") {
    return [
      { label: "Initializing browser session", completed: false, active: true },
      { label: "Navigating to page", completed: false, active: false },
      { label: "Waiting for page to load", completed: false, active: false },
      { label: "Extracting data from page", completed: false, active: false },
      { label: "Processing results", completed: false, active: false },
    ];
  } else if (toolName === "browser_act") {
    return [
      { label: "Initializing browser session", completed: false, active: true },
      { label: "Navigating to page", completed: false, active: false },
      { label: "Locating element", completed: false, active: false },
      { label: "Performing action", completed: false, active: false },
      { label: "Capturing screenshot", completed: false, active: false },
    ];
  } else if (toolName === "browser_observe") {
    return [
      { label: "Initializing browser session", completed: false, active: true },
      { label: "Navigating to page", completed: false, active: false },
      { label: "Analyzing page structure", completed: false, active: false },
      { label: "Identifying interactive elements", completed: false, active: false },
    ];
  } else if (toolName === "browser_agent") {
    return [
      { label: "Initializing autonomous agent", completed: false, active: true },
      { label: "Planning workflow steps", completed: false, active: false },
      { label: "Navigating and interacting", completed: false, active: false },
      { label: "Extracting target data", completed: false, active: false },
      { label: "Completing workflow", completed: false, active: false },
    ];
  }

  return [
    { label: "Starting browser automation", completed: false, active: true },
    { label: "Processing request", completed: false, active: false },
  ];
}

export type { ProgressStep };
