import type { AgentTemplateRow } from "@/types/AgentTemplates";
import { interpolatePrompt } from "./interpolatePrompt";

export type RunOnboardingTaskParams = {
  template: AgentTemplateRow;
  artistName: string;
  artistId: string;
  userEmail: string;
  accessToken: string;
};

export type RunOnboardingTaskResult = {
  success: boolean;
  result: string;
  error?: string;
};

/**
 * Executes an onboarding task by calling the chat/generate API.
 *
 * Takes a template from agent_templates, interpolates the prompt with
 * artist name and user email, then calls the chat API to execute the task.
 * The AI will use available MCP tools (like send_email) to complete the task.
 */
export async function runOnboardingTask({
  template,
  artistName,
  artistId,
  userEmail,
  accessToken,
}: RunOnboardingTaskParams): Promise<RunOnboardingTaskResult> {
  try {
    const interpolatedPrompt = interpolatePrompt(
      template.prompt,
      artistName,
      userEmail
    );

    const response = await fetch("/api/chat/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        prompt: interpolatedPrompt,
        artistId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        result: "",
        error: `API error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      result: data.text || "",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      result: "",
      error: errorMessage,
    };
  }
}

export default runOnboardingTask;
