import { Stagehand } from "@browserbasehq/stagehand";

/**
 *
 */
export async function initStagehand(): Promise<{
  stagehand: Stagehand;
  sessionUrl?: string;
  liveViewUrl?: string;
  debugUrl?: string;
}> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    throw new Error(
      "Missing Browserbase credentials. Please set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID environment variables.",
    );
  }

  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey,
    projectId,
    enableCaching: false,
    verbose: 1,
    logger: console.log,
    disablePino: true,
  });

  const initResult = await stagehand.init();

  return {
    stagehand,
    sessionUrl: initResult.sessionUrl,
    liveViewUrl: initResult.debugUrl,
    debugUrl: initResult.debugUrl,
  };
}
