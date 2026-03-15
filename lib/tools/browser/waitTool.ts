import { z } from "zod";
import { tool } from "ai";

const waitTool = tool({
  description: `Wait for a specified number of seconds before continuing.

WHEN TO USE THIS TOOL:
✓ Between multiple browser_observe calls to avoid rate limiting
✓ Before retrying after Instagram/TikTok rate limits
✓ To space out social media profile scraping
✓ After getting "Take a quick pause" errors

RATE LIMITING PREVENTION:
• Instagram: Wait 30-60 seconds between profile checks
• TikTok: Wait 20-30 seconds between profiles  
• Twitter: Wait 15-30 seconds between profiles
• After rate limit error: Wait 5-10 minutes

USAGE:
✓ "Wait 60 seconds before checking the next Instagram profile"
✓ "Pause for 2 minutes to avoid rate limiting"
✓ "Wait 30 seconds then try again"

This tool helps avoid detection as automated traffic by spacing out requests naturally.`,
  inputSchema: z.object({
    seconds: z.number().min(1).max(600).describe("Number of seconds to wait (1-600)"),
  }),
  execute: async ({ seconds }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, seconds * 1000));

      return {
        success: true,
        message: `Waited ${seconds} seconds successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export default waitTool;
