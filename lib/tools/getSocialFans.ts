import { z } from "zod";
import { tool } from "ai";
import { selectSocialFans } from "@/lib/supabase/social_fans/selectSocialFans";

// Zod schema for parameter validation
const schema = z.object({
  social_ids: z
    .array(z.string().min(1, "Social ID is required"))
    .min(1, "At least one social ID is required"),
});

const getSocialFans = tool({
  description:
    "Retrieve social fans data for given artist social IDs. This tool fetches fan engagement data from the social_fans table.",
  inputSchema: schema,
  execute: async ({ social_ids }) => {
    try {
      const socialFans = await selectSocialFans({ social_ids });

      return {
        success: true,
        data: socialFans,
        count: socialFans.length,
      };
    } catch (error) {
      console.error("Error fetching social fans:", error);
      return {
        success: false,
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch social fans",
        data: [],
        count: 0,
      };
    }
  },
});

export default getSocialFans;
