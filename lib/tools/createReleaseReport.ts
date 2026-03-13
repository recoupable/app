import { z } from "zod";
import { tool } from "ai";

const TOOL_CHAIN_STEPS = [
  "get_youtube_channel_video_list - search for videos from the active artist related to the release",
  "get_spotify_artist_albums - search for songs from the active artist related to the release",
];

const createReleaseReport = tool({
  description: `
  Creates a release report for the input song title by searching for videos and songs related to the release.
  Follows this tool loop:
  <tool_loop>
  ${TOOL_CHAIN_STEPS.join("\n")}
  </tool_loop>

  Keep going until the job is completely solved before ending your turn.
  If you're unsure, use your tools, don't guess.
  Plan thoroughly before every tool call and reflect on the outcome after each tool call.
  `,
  inputSchema: z.object({
    songTitle: z.string().describe("The title of the song to create a release report for"),
  }),
  execute: async ({ songTitle }) => {
    return {
      success: true,
      songTitle,
      nextSteps: TOOL_CHAIN_STEPS,
      message: "Follow the tool loop to create a release report.",
    };
  },
});

export default createReleaseReport;
